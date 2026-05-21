import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../../config/env';
import { RedisCache, isRedisAvailable } from '../../../config/redis';
import { JwtPayload, TokenPair } from '../auth.types';
import { AppError } from '../../../utils/appError';
import { hashToken } from '../../../utils/crypto';

const refreshTokenCache = new RedisCache('refresh_token', 7 * 24 * 3600);
const blacklistCache = new RedisCache('token_blacklist', 24 * 3600);

export class TokenService {
  generateTokenPair(
    payload: Omit<JwtPayload, 'iat' | 'exp'>,
  ): TokenPair {
    const accessToken = jwt.sign(
      payload,
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any },
    );
    const refreshToken = jwt.sign(
      { sub: payload.sub, sessionId: payload.sessionId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any },
    );
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch (err) {
      if ((err as any).name === 'TokenExpiredError') {
        throw AppError.unauthorized('Access token expired');
      }
      throw AppError.unauthorized('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): { sub: string; sessionId: string } {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; sessionId: string };
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
  }

  async storeRefreshToken(userId: string, sessionId: string, token: string): Promise<void> {
    const hashed = hashToken(token);
    await refreshTokenCache.set(`${userId}:${sessionId}`, hashed, 7 * 24 * 3600);
  }

  async validateRefreshToken(userId: string, sessionId: string, token: string): Promise<boolean> {
    // When Redis is unavailable (dev/no-cache mode) the in-memory store is wiped on every
    // server restart, making stored-hash validation unreliable. Fall back to trusting the
    // JWT signature alone — already verified by verifyRefreshToken() before this is called.
    if (!isRedisAvailable()) return true;

    const stored = await refreshTokenCache.get<string>(`${userId}:${sessionId}`);
    if (!stored) return false;
    return stored === hashToken(token);
  }

  async revokeRefreshToken(userId: string, sessionId: string): Promise<void> {
    await refreshTokenCache.del(`${userId}:${sessionId}`);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await refreshTokenCache.invalidatePattern(userId);
  }

  async blacklistAccessToken(token: string, expiresInSeconds: number): Promise<void> {
    const hashed = hashToken(token);
    await blacklistCache.set(hashed, 1, expiresInSeconds);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const hashed = hashToken(token);
    return blacklistCache.exists(hashed);
  }

  generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
    });
  }
}

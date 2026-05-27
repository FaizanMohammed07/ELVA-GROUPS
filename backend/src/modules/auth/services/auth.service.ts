import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../../users/repositories/user.repository';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { EmailService } from '../../notifications/services/email.service';
import { ReferralService } from '../../referrals/services/referral.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import {
  LoginPayload,
  RegisterPayload,
  TokenPair,
  OAuthProfile,
} from '../auth.types';
import { AppError } from '../../../utils/appError';
import {
  hashPassword,
  comparePassword,
  generateRandomToken,
  hashToken,
  generateDeviceFingerprint,
} from '../../../utils/crypto';
import { logger } from '../../../utils/logger';
import { RedisCache } from '../../../config/cache';
import { Request } from 'express';

const otpCache = new RedisCache('otp', 600);
const resetTokenCache = new RedisCache('reset_token', 3600);
const verifyTokenCache = new RedisCache('verify_token', 86400);

export class AuthService {
  private userRepo = new UserRepository();
  private tokenService = new TokenService();
  private sessionService = new SessionService();
  private emailService = new EmailService();
  private referralService = new ReferralService();
  private loyaltyService = new LoyaltyService();

  async register(payload: RegisterPayload, req: Request): Promise<{ user: any; tokens: TokenPair }> {
    const existing = await this.userRepo.findByEmail(payload.email);
    if (existing) throw AppError.conflict('Email already registered');

    const passwordHash = await hashPassword(payload.password);
    const verificationToken = generateRandomToken();

    const user = await this.userRepo.create({
      name: payload.name,
      email: payload.email,
      ...(payload.phone && { phone: payload.phone }),
      passwordHash,
      role: 'customer',
      isEmailVerified: false,
      tokenVersion: 0,
    });

    await verifyTokenCache.set(hashToken(verificationToken), user.id, 86400);
    await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    if (payload.referralCode) {
      await this.referralService.applyReferral(payload.referralCode, user.id).catch((e) =>
        logger.warn({ e }, 'Referral apply failed'),
      );
    }

    await this.loyaltyService.addPoints(user.id, 100, 'WELCOME_BONUS');

    const tokens = await this.createSession(user, req);
    logger.info({ userId: user.id, email: user.email }, 'User registered');

    return { user: this.sanitizeUser(user), tokens };
  }

  async login(payload: LoginPayload, req: Request): Promise<{ user: any; tokens: TokenPair }> {
    const user = await this.userRepo.findByEmailWithPassword(payload.email);
    if (!user) throw AppError.unauthorized('Invalid email or password');

    if (!user.passwordHash) throw AppError.unauthorized('Invalid email or password');
    const passwordValid = await comparePassword(payload.password, user.passwordHash);
    if (!passwordValid) {
      await this.userRepo.incrementFailedLogins(user.id);
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) throw AppError.unauthorized('Account is deactivated. Contact support.');
    if (user.isLocked) throw AppError.unauthorized('Account is locked. Please reset your password.');

    await this.userRepo.resetFailedLogins(user.id);
    await this.userRepo.updateLastLogin(user.id);

    const tokens = await this.createSession(user, req);
    logger.info({ userId: user.id }, 'User logged in');

    return { user: this.sanitizeUser(user), tokens };
  }

  async refresh(refreshToken: string, req: Request): Promise<TokenPair> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const isValid = await this.tokenService.validateRefreshToken(
      payload.sub,
      payload.sessionId,
      refreshToken,
    );
    if (!isValid) throw AppError.unauthorized('Invalid refresh token');

    const user = await this.userRepo.findById(payload.sub);
    if (!user || !user.isActive) throw AppError.unauthorized();

    await this.tokenService.revokeRefreshToken(payload.sub, payload.sessionId);

    const newSessionId = uuidv4();
    const tokens = this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: newSessionId,
      tokenVersion: user.tokenVersion,
    });

    await this.tokenService.storeRefreshToken(user.id, newSessionId, tokens.refreshToken);
    await this.sessionService.rotateSession(user.id, payload.sessionId, newSessionId, req);

    return tokens;
  }

  async logout(userId: string, sessionId: string, accessToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(userId, sessionId);
    const decoded = this.tokenService.verifyAccessToken(accessToken);
    const remainingTtl = (decoded.exp ?? 0) - Math.floor(Date.now() / 1000);
    if (remainingTtl > 0) {
      await this.tokenService.blacklistAccessToken(accessToken, remainingTtl);
    }
    await this.sessionService.revokeSession(userId, sessionId);
    logger.info({ userId, sessionId }, 'User logged out');
  }

  async logoutAll(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
    await this.userRepo.incrementTokenVersion(userId);
    await this.sessionService.revokeAllSessions(userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return; // Silently succeed to prevent email enumeration

    const token = generateRandomToken();
    await resetTokenCache.set(hashToken(token), user.id, 3600);
    await this.emailService.sendPasswordResetEmail(user.email, user.name, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const userId = await resetTokenCache.get<string>(hashToken(token));
    if (!userId) throw AppError.badRequest('Invalid or expired reset token');

    const user = await this.userRepo.findById(userId);
    if (!user) throw AppError.badRequest('Invalid or expired reset token');

    const passwordHash = await hashPassword(newPassword);
    await this.userRepo.updatePassword(user.id, passwordHash);
    await this.tokenService.revokeAllUserTokens(user.id);
    await resetTokenCache.del(hashToken(token));
    await this.emailService.sendPasswordChangedEmail(user.email, user.name);
  }

  async verifyEmail(token: string): Promise<void> {
    const userId = await verifyTokenCache.get<string>(hashToken(token));
    if (!userId) throw AppError.badRequest('Invalid or expired verification token');

    const user = await this.userRepo.findById(userId);
    if (!user) throw AppError.badRequest('Invalid or expired verification token');

    await this.userRepo.verifyEmail(user.id);
    await verifyTokenCache.del(hashToken(token));
  }

  async oauthLogin(profile: OAuthProfile, req: Request): Promise<{ user: any; tokens: TokenPair; isNew: boolean }> {
    let user = await this.userRepo.findByOAuthProvider(profile.provider, profile.providerId);
    let isNew = false;

    if (!user) {
      user = await this.userRepo.findByEmail(profile.email);
      if (user) {
        await this.userRepo.linkOAuthProvider(user.id, profile.provider, profile.providerId);
      } else {
        user = await this.userRepo.create({
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          role: 'customer',
          isEmailVerified: true,
          tokenVersion: 0,
          oauthProviders: [{ provider: profile.provider, providerId: profile.providerId }],
        });
        await this.loyaltyService.addPoints(user.id, 100, 'WELCOME_BONUS');
        isNew = true;
      }
    }

    const tokens = await this.createSession(user, req);
    return { user: this.sanitizeUser(user), tokens, isNew };
  }

  private async createSession(user: any, req: Request): Promise<TokenPair> {
    const sessionId = uuidv4();
    const tokens = this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      tokenVersion: user.tokenVersion,
    });
    await this.tokenService.storeRefreshToken(user.id, sessionId, tokens.refreshToken);

    const fingerprint = generateDeviceFingerprint(
      req.headers['user-agent'] || '',
      req.ip || '',
      req.headers['accept-language'] || '',
    );
    await this.sessionService.createSession(user.id, sessionId, fingerprint, req);
    return tokens;
  }

  private sanitizeUser(user: any) {
    const { passwordHash, tokenVersion, ...safe } = user.toObject?.() ?? user;
    return safe;
  }
}

import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../modules/auth/services/token.service';
import { UserRepository } from '../modules/users/repositories/user.repository';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
        sessionId: string;
      };
    }
  }
}

const tokenService = new TokenService();
const userRepo = new UserRepository();

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.signedCookies?.accessToken;

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : cookieToken;

  if (!token) throw AppError.unauthorized('Authentication required');

  const payload = tokenService.verifyAccessToken(token);

  if (await tokenService.isTokenBlacklisted(token)) {
    throw AppError.unauthorized('Token has been revoked');
  }

  const user = await userRepo.findById(payload.sub);

  if (!user) throw AppError.unauthorized('User not found');
  if (!user.isActive) throw AppError.unauthorized('Account is deactivated');
  if (user.tokenVersion !== payload.tokenVersion) {
    throw AppError.unauthorized('Session expired. Please log in again.');
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    sessionId: payload.sessionId,
  };

  logger.debug({ userId: user.id, role: user.role }, 'User authenticated');
  next();
};

export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await authenticate(req, res, next);
  } catch {
    next();
  }
};

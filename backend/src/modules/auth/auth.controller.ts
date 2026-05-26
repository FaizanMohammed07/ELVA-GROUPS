import { Request, Response } from 'express';
import { AuthService } from './services/auth.service';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { env } from '../../config/env';
import { verifyFirebaseToken } from '../../config/firebase';
import { AppError } from '../../utils/appError';

const authService = new AuthService();

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  domain: env.COOKIE_DOMAIN,
  signed: true,
};

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await authService.register(req.body, req);
    res
      .cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 3600 * 1000 });
    sendCreated(res, { user, tokens }, 'Registration successful');
  },

  async login(req: Request, res: Response): Promise<void> {
    const { user, tokens } = await authService.login(req.body, req);
    const maxAge = req.body.rememberMe ? 30 * 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000;
    res
      .cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge });
    sendSuccess(res, { user, tokens }, 'Login successful');
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.signedCookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) throw new Error('Refresh token required');
    const tokens = await authService.refresh(refreshToken, req);
    res
      .cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 3600 * 1000 });
    sendSuccess(res, { tokens }, 'Token refreshed');
  },

  async logout(req: Request, res: Response): Promise<void> {
    const accessToken = req.headers.authorization?.slice(7) || req.signedCookies?.accessToken || '';
    await authService.logout(req.user!.id, req.user!.sessionId, accessToken);
    res
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions);
    sendSuccess(res, null, 'Logged out successfully');
  },

  async logoutAll(req: Request, res: Response): Promise<void> {
    await authService.logoutAll(req.user!.id);
    res
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions);
    sendSuccess(res, null, 'Logged out from all devices');
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, 'If an account exists, a reset email has been sent.');
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, 'Password reset successful. Please log in.');
  },

  async verifyEmail(req: Request, res: Response): Promise<void> {
    await authService.verifyEmail(req.body.token);
    sendSuccess(res, null, 'Email verified successfully');
  },

  async me(req: Request, res: Response): Promise<void> {
    sendSuccess(res, req.user, 'User profile fetched');
  },

  async firebaseLogin(req: Request, res: Response): Promise<void> {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') throw AppError.badRequest('idToken is required');

    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired Firebase token');
    }

    const profile = {
      provider: 'google' as const,
      providerId: decoded.uid,
      email: decoded.email ?? '',
      name: decoded.name ?? decoded.email?.split('@')[0] ?? 'User',
      avatar: decoded.picture,
    };

    if (!profile.email) throw AppError.badRequest('Firebase token missing email');

    const { user, tokens, isNew } = await authService.oauthLogin(profile, req);
    res
      .cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 })
      .cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 3600 * 1000 });
    sendSuccess(res, { user, tokens, isNew }, isNew ? 'Account created successfully' : 'Login successful');
  },
};

import { Router, Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { UserRepository } from '../users/repositories/user.repository';
import { UserModel } from '../users/models/user.model';
import { comparePassword, hashPassword } from '../../utils/crypto';
import { sendSuccess } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validators';

const userRepo = new UserRepository();

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validateBody(registerSchema), AuthController.register);
authRouter.post('/login', authRateLimiter, validateBody(loginSchema), AuthController.login);
authRouter.post('/refresh', AuthController.refresh);
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.post('/logout-all', authenticate, AuthController.logoutAll);
authRouter.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), AuthController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), AuthController.resetPassword);
authRouter.post('/verify-email', validateBody(verifyEmailSchema), AuthController.verifyEmail);
authRouter.get('/me', authenticate, AuthController.me);
authRouter.post('/firebase', authRateLimiter, AuthController.firebaseLogin);

authRouter.post('/change-password', authenticate, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw AppError.badRequest('currentPassword and newPassword are required');
  if (newPassword.length < 8) throw AppError.badRequest('Password must be at least 8 characters');
  const user = await UserModel.findById(req.user!.id).select('+passwordHash').exec();
  if (!user) throw AppError.notFound('User not found');
  const valid = await comparePassword(currentPassword, user.passwordHash ?? '');
  if (!valid) throw AppError.unauthorized('Current password is incorrect');
  const newHash = await hashPassword(newPassword);
  await userRepo.updatePassword(req.user!.id, newHash);
  sendSuccess(res, null, 'Password changed successfully');
});

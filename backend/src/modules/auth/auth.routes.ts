import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authRateLimiter } from '../../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validators';

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

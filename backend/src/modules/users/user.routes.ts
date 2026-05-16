import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin, requireSuperAdmin } from '../../middleware/authorize';
import { UserController } from './user.controller';

export const userRouter = Router();

// Public
userRouter.get('/profile/:id', UserController.getPublicProfile);

// Customer (self)
userRouter.use(authenticate);
userRouter.get('/me', UserController.getMe);
userRouter.put('/me', UserController.updateMe);
userRouter.get('/me/addresses', UserController.getAddresses);
userRouter.post('/me/addresses', UserController.addAddress);
userRouter.put('/me/addresses/:addressId', UserController.updateAddress);
userRouter.delete('/me/addresses/:addressId', UserController.deleteAddress);
userRouter.put('/me/preferences', UserController.updatePreferences);
userRouter.get('/me/orders', UserController.getMyOrders);
userRouter.get('/me/sessions', UserController.getMySessions);
userRouter.delete('/me/sessions/:sessionId', UserController.revokeSession);

// Admin
userRouter.use(requireAdmin);
userRouter.get('/', UserController.listUsers);
userRouter.get('/:id', UserController.getUserById);
userRouter.patch('/:id/status', UserController.toggleUserStatus);
userRouter.patch('/:id/role', requireSuperAdmin, UserController.updateUserRole);
userRouter.delete('/:id', requireSuperAdmin, UserController.deleteUser);

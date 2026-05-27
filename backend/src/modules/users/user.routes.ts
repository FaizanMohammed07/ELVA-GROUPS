import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin, requireSuperAdmin } from '../../middleware/authorize';
import { validateMongoId } from '../../middleware/mongoId';
import { UserController } from './user.controller';

export const userRouter = Router();

// Public — only safe static info
userRouter.get('/profile/:id', validateMongoId(), UserController.getPublicProfile);

// Customer (self)
userRouter.use(authenticate);
userRouter.get('/me', UserController.getMe);
userRouter.put('/me', UserController.updateMe);
userRouter.get('/me/addresses', UserController.getAddresses);
userRouter.post('/me/addresses', UserController.addAddress);
userRouter.put('/me/addresses/:addressId', validateMongoId('addressId'), UserController.updateAddress);
userRouter.delete('/me/addresses/:addressId', validateMongoId('addressId'), UserController.deleteAddress);
userRouter.patch('/me/addresses/:addressId/default', validateMongoId('addressId'), UserController.setDefaultAddress);
userRouter.put('/me/preferences', UserController.updatePreferences);
userRouter.get('/me/orders', UserController.getMyOrders);
userRouter.get('/me/sessions', UserController.getMySessions);
userRouter.delete('/me/sessions/:sessionId', UserController.revokeSession);

// Admin
userRouter.use(requireAdmin);
userRouter.get('/', UserController.listUsers);
userRouter.get('/:id', validateMongoId(), UserController.getUserById);
userRouter.patch('/:id/status', validateMongoId(), UserController.toggleUserStatus);
userRouter.patch('/:id/role', validateMongoId(), requireSuperAdmin, UserController.updateUserRole);
userRouter.delete('/:id', validateMongoId(), requireSuperAdmin, UserController.deleteUser);

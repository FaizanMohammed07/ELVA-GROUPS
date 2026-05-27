import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin, requireSuperAdmin } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { validateMongoId } from '../../middleware/mongoId';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { UserModel } from '../users/models/user.model';
import { OrderModel } from '../orders/models/order.model';
import { ProductModel } from '../products/models/product.model';
import { hashPassword } from '../../utils/crypto';

const createStaffSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  role: z.enum(['admin', 'support', 'marketing', 'inventory']),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'support', 'marketing', 'inventory']),
  permissions: z.array(z.string().max(100).regex(/^[a-z_:]+$/)).optional(),
});

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

// Staff management — super admin only
adminRouter.get('/staff', requireSuperAdmin, async (_req, res) => {
  const staff = await UserModel.find({ role: { $in: ['admin', 'support', 'marketing', 'inventory'] } })
    .select('name email role isActive lastLoginAt createdAt');
  sendSuccess(res, staff, 'Staff list');
});

adminRouter.post('/staff/create', requireSuperAdmin, validateBody(createStaffSchema), async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await UserModel.findOne({ email });
  if (existing) throw AppError.conflict('Email already registered');

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    name,
    email,
    passwordHash,
    role,
    isEmailVerified: true,
    isActive: true,
    tokenVersion: 0,
  });

  sendCreated(res, { id: user.id, name: user.name, email: user.email, role: user.role }, 'Admin user created');
});

adminRouter.post('/staff/invite', requireSuperAdmin, async (req, res) => {
  sendSuccess(res, null, 'Invitation sent');
});

adminRouter.patch('/staff/:id/role', requireSuperAdmin, validateMongoId(), validateBody(updateRoleSchema), async (req, res) => {
  const { role, permissions } = req.body;
  const safePermissions = (permissions ?? []).filter((p: string) => p !== '*');
  await UserModel.findByIdAndUpdate(req.params["id"] as string, { $set: { role, permissions: safePermissions } });
  sendSuccess(res, null, 'Role updated');
});

adminRouter.patch('/staff/:id/deactivate', requireSuperAdmin, validateMongoId(), async (req, res) => {
  await UserModel.findByIdAndUpdate(req.params["id"] as string, { $set: { isActive: false } });
  sendSuccess(res, null, 'Staff deactivated');
});

// Quick stats for all admins
adminRouter.get('/quick-stats', async (_req, res) => {
  const [pendingOrders, lowStock, pendingReviews, activeUsers] = await Promise.all([
    OrderModel.countDocuments({ status: 'pending' }),
    ProductModel.countDocuments({ status: 'active', $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
    0, // ReviewModel.countDocuments({ isApproved: false })
    UserModel.countDocuments({ isActive: true, role: 'customer' }),
  ]);
  sendSuccess(res, { pendingOrders, lowStock, pendingReviews, activeUsers }, 'Quick stats');
});

// Audit log (super admin only)
adminRouter.get('/audit-logs', requireSuperAdmin, async (_req, res) => {
  sendSuccess(res, [], 'Audit logs');
});

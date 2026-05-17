import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin, requireSuperAdmin } from '../../middleware/authorize';
import { sendSuccess } from '../../utils/apiResponse';
import { UserModel } from '../users/models/user.model';
import { OrderModel } from '../orders/models/order.model';
import { ProductModel } from '../products/models/product.model';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

// Staff management — super admin only
adminRouter.get('/staff', requireSuperAdmin, async (_req, res) => {
  const staff = await UserModel.find({ role: { $in: ['admin', 'support', 'marketing', 'inventory'] } })
    .select('name email role isActive lastLoginAt createdAt');
  sendSuccess(res, staff, 'Staff list');
});

adminRouter.post('/staff/invite', requireSuperAdmin, async (req, res) => {
  sendSuccess(res, null, 'Invitation sent');
});

adminRouter.patch('/staff/:id/role', requireSuperAdmin, async (req, res) => {
  await UserModel.findByIdAndUpdate(req.params["id"] as string, { $set: { role: req.body.role, permissions: req.body.permissions || [] } });
  sendSuccess(res, null, 'Role updated');
});

adminRouter.patch('/staff/:id/deactivate', requireSuperAdmin, async (req, res) => {
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

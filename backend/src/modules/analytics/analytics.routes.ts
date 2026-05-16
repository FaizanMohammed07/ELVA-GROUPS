import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin, requireSuperAdmin } from '../../middleware/authorize';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate, requireAdmin);

analyticsRouter.get('/dashboard', AnalyticsController.getDashboard);
analyticsRouter.get('/revenue', AnalyticsController.getRevenue);
analyticsRouter.get('/users', AnalyticsController.getUserStats);
analyticsRouter.get('/products/top', AnalyticsController.getTopProducts);
analyticsRouter.get('/orders/status', AnalyticsController.getOrderStatus);
analyticsRouter.get('/inventory/alerts', AnalyticsController.getInventoryAlerts);
analyticsRouter.get('/conversion', AnalyticsController.getConversion);

// Super admin only
analyticsRouter.get('/revenue/categories', requireSuperAdmin, AnalyticsController.getRevenueByCategory);
analyticsRouter.get('/payments/breakdown', requireSuperAdmin, AnalyticsController.getPaymentBreakdown);
analyticsRouter.get('/cfo-summary', requireSuperAdmin, AnalyticsController.getCfoSummary);

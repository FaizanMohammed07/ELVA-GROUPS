import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { validateMongoId } from '../../middleware/mongoId';
import { orderCreateLimiter } from '../../middleware/rateLimiter';
import {
  createOrderSchema,
  cancelOrderSchema,
  returnOrderSchema,
  updateOrderStatusSchema,
  updateTrackingSchema,
} from './order.validators';

export const orderRouter = Router();

orderRouter.use(authenticate);

// Customer
orderRouter.post(
  '/',
  orderCreateLimiter,
  validateBody(createOrderSchema),
  OrderController.createOrder,
);
orderRouter.get('/my', OrderController.getMyOrders);
orderRouter.get('/my/number/:orderNumber', OrderController.getMyOrderByNumber);
orderRouter.get('/my/:id', validateMongoId(), OrderController.getMyOrder);
orderRouter.post('/my/:id/cancel', validateMongoId(), validateBody(cancelOrderSchema), OrderController.cancelOrder);
orderRouter.post('/my/:id/return', validateMongoId(), validateBody(returnOrderSchema), OrderController.requestReturn);

// Admin
orderRouter.get('/', requireAdmin, OrderController.listOrders);
orderRouter.get('/:id', requireAdmin, validateMongoId(), OrderController.getOrder);
orderRouter.patch('/:id/status', requireAdmin, validateMongoId(), validateBody(updateOrderStatusSchema), OrderController.updateStatus);
orderRouter.post('/:id/tracking', requireAdmin, validateMongoId(), validateBody(updateTrackingSchema), OrderController.updateTracking);

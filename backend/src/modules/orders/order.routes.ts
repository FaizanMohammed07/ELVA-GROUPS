import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';

export const orderRouter = Router();

orderRouter.use(authenticate);

// Customer
orderRouter.post('/', OrderController.createOrder);
orderRouter.get('/my', OrderController.getMyOrders);
orderRouter.get('/my/number/:orderNumber', OrderController.getMyOrderByNumber);
orderRouter.get('/my/:id', OrderController.getMyOrder);
orderRouter.post('/my/:id/cancel', OrderController.cancelOrder);
orderRouter.post('/my/:id/return', OrderController.requestReturn);

// Admin
orderRouter.get('/', requireAdmin, OrderController.listOrders);
orderRouter.get('/:id', requireAdmin, OrderController.getOrder);
orderRouter.patch('/:id/status', requireAdmin, OrderController.updateStatus);
orderRouter.post('/:id/tracking', requireAdmin, OrderController.updateTracking);

import { Router } from 'express';
import express from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { paymentRateLimiter } from '../../middleware/rateLimiter';

export const paymentRouter = Router();

// Webhook (raw body needed for signature verification)
paymentRouter.post(
  '/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook,
);

paymentRouter.use(authenticate);

paymentRouter.post('/create-order', paymentRateLimiter, PaymentController.createOrder);
paymentRouter.post('/verify', paymentRateLimiter, PaymentController.verifyPayment);

// Admin
paymentRouter.post('/:orderId/refund', requireAdmin, PaymentController.refund);

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { OrderModel } from '../../orders/models/order.model';
import { AppError } from '../../../utils/appError';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID ?? '',
  key_secret: env.RAZORPAY_KEY_SECRET ?? '',
});

export class PaymentService {
  async createRazorpayOrder(orderId: string, userId: string): Promise<any> {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) throw AppError.notFound('Order not found');

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await OrderModel.findByIdAndUpdate(orderId, {
      $set: { razorpayOrderId: razorpayOrder.id },
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: env.RAZORPAY_KEY_ID,
    };
  }

  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<boolean> {
    const body = `${payload.razorpay_order_id}|${payload.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET ?? '')
      .update(body)
      .digest('hex');

    return expectedSignature === payload.razorpay_signature;
  }

  async confirmPayment(
    orderId: string,
    userId: string,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    signature: string,
  ): Promise<void> {
    // Verify signature
    const isValid = await this.verifyPayment({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature,
    });
    if (!isValid) throw AppError.badRequest('Payment verification failed');

    // Ownership check: ensure the razorpayOrderId in DB matches what was submitted
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) throw AppError.notFound('Order not found');
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
      throw AppError.forbidden('Payment does not belong to this order');
    }

    // Atomic idempotency: only update if still pending (prevents double-confirm)
    const updated = await OrderModel.findOneAndUpdate(
      { _id: orderId, paymentStatus: { $ne: 'paid' } },
      {
        $set: {
          paymentStatus: 'paid',
          status: 'confirmed',
          razorpayPaymentId,
        },
        $push: {
          timeline: { status: 'confirmed', message: 'Payment confirmed', timestamp: new Date() },
        },
      },
      { new: true },
    );

    if (!updated) {
      logger.info({ orderId }, 'confirmPayment: already paid (idempotent)');
      return;
    }

    logger.info({ orderId, razorpayPaymentId }, 'Payment confirmed');
  }

  async handleWebhook(body: string, signature: string): Promise<void> {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET ?? '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw AppError.unauthorized('Invalid webhook signature');
    }

    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      throw AppError.badRequest('Invalid webhook payload');
    }
    logger.info({ event: event.event }, 'Razorpay webhook received');

    switch (event.event) {
      case 'payment.captured': {
        const paymentId = event.payload.payment.entity.id;
        const orderId = event.payload.payment.entity.notes?.orderId;
        if (orderId) {
          // Idempotent: only update if not already paid
          const result = await OrderModel.findOneAndUpdate(
            { _id: orderId, paymentStatus: { $ne: 'paid' } },
            {
              $set: {
                paymentStatus: 'paid',
                status: 'confirmed',
                razorpayPaymentId: paymentId,
              },
              $push: {
                timeline: { status: 'confirmed', message: 'Payment captured via webhook', timestamp: new Date() },
              },
            },
          );
          if (!result) {
            logger.info({ orderId }, 'Webhook payment.captured: already processed (idempotent)');
          }
        }
        break;
      }
      case 'payment.failed': {
        const orderId = event.payload.payment.entity.notes?.orderId;
        if (orderId) {
          await OrderModel.findOneAndUpdate(
            { _id: orderId, paymentStatus: 'pending' },
            {
              $set: { paymentStatus: 'failed' },
              $push: {
                timeline: { status: 'pending', message: 'Payment failed', timestamp: new Date() },
              },
            },
          );
        }
        break;
      }
      default:
        logger.debug({ event: event.event }, 'Unhandled webhook event');
    }
  }

  async initiateRefund(orderId: string, amount?: number): Promise<void> {
    const order = await OrderModel.findById(orderId);
    if (!order) throw AppError.notFound('Order not found');
    if (!order.razorpayPaymentId) throw AppError.badRequest('No payment to refund');

    // Idempotency guard — prevent double-refund
    if (['refunded', 'partially_refunded'].includes(order.paymentStatus)) {
      throw AppError.conflict('Order has already been refunded');
    }

    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.total * 100);

    // Call Razorpay first; only update DB on success (atomicity)
    await razorpay.payments.refund(order.razorpayPaymentId, { amount: refundAmount });

    const paymentStatus = amount && amount < order.total ? 'partially_refunded' : 'refunded';
    await OrderModel.findByIdAndUpdate(orderId, {
      $set: { paymentStatus, status: 'refunded' },
      $push: {
        timeline: { status: 'refunded', message: `Refund of ₹${(refundAmount / 100).toFixed(2)} initiated`, timestamp: new Date() },
      },
    });
  }
}

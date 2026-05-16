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
  async createRazorpayOrder(orderId: string): Promise<any> {
    const order = await OrderModel.findById(orderId);
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
    razorpayPaymentId: string,
    razorpayOrderId: string,
    signature: string,
  ): Promise<void> {
    const isValid = await this.verifyPayment({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: signature,
    });

    if (!isValid) throw AppError.badRequest('Payment verification failed');

    await OrderModel.findByIdAndUpdate(orderId, {
      $set: {
        paymentStatus: 'paid',
        status: 'confirmed',
        razorpayPaymentId,
      },
      $push: {
        timeline: { status: 'confirmed', message: 'Payment confirmed', timestamp: new Date() },
      },
    });

    logger.info('Payment confirmed', { orderId, razorpayPaymentId });
  }

  async handleWebhook(body: string, signature: string): Promise<void> {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET ?? '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw AppError.unauthorized('Invalid webhook signature');
    }

    const event = JSON.parse(body);
    logger.info('Razorpay webhook received', { event: event.event });

    switch (event.event) {
      case 'payment.captured': {
        const paymentId = event.payload.payment.entity.id;
        const orderId = event.payload.payment.entity.notes?.orderId;
        if (orderId) {
          await OrderModel.findByIdAndUpdate(orderId, {
            $set: { paymentStatus: 'paid', razorpayPaymentId: paymentId },
          });
        }
        break;
      }
      case 'payment.failed': {
        const orderId = event.payload.payment.entity.notes?.orderId;
        if (orderId) {
          await OrderModel.findByIdAndUpdate(orderId, {
            $set: { paymentStatus: 'failed' },
          });
        }
        break;
      }
      default:
        logger.debug('Unhandled webhook event', { event: event.event });
    }
  }

  async initiateRefund(orderId: string, amount?: number): Promise<void> {
    const order = await OrderModel.findById(orderId);
    if (!order) throw AppError.notFound('Order not found');
    if (!order.razorpayPaymentId) throw AppError.badRequest('No payment to refund');

    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.total * 100);
    await razorpay.payments.refund(order.razorpayPaymentId, { amount: refundAmount });

    const paymentStatus = amount && amount < order.total ? 'partially_refunded' : 'refunded';
    await OrderModel.findByIdAndUpdate(orderId, { $set: { paymentStatus, status: 'refunded' } });
  }
}

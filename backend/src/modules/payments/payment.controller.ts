import { Request, Response } from 'express';
import { PaymentService } from './services/payment.service';
import { sendSuccess } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';

const paymentService = new PaymentService();

export const PaymentController = {
  async createOrder(req: Request, res: Response): Promise<void> {
    const { orderId } = req.body;
    if (!orderId) throw AppError.badRequest('orderId is required');
    const data = await paymentService.createRazorpayOrder(orderId);
    sendSuccess(res, data, 'Payment order created');
  },

  async verifyPayment(req: Request, res: Response): Promise<void> {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    await paymentService.confirmPayment(orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature);
    sendSuccess(res, null, 'Payment confirmed');
  },

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) throw AppError.unauthorized('Missing webhook signature');
    await paymentService.handleWebhook(req.body.toString(), signature);
    res.json({ received: true });
  },

  async refund(req: Request, res: Response): Promise<void> {
    const { amount } = req.body;
    await paymentService.initiateRefund(req.params["orderId"] as string, amount);
    sendSuccess(res, null, 'Refund initiated');
  },
};

export interface IRazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
}

export interface IPaymentVerification {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface IRefund {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  reason: string;
  createdAt: string;
}

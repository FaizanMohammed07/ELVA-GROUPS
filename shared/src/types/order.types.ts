export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export type PaymentMethod = 'razorpay' | 'cod' | 'wallet';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  quantity: number;
  personalization?: Record<string, string>;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrderTimeline {
  status: OrderStatus;
  timestamp: string;
  message?: string;
  updatedBy?: string;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  finalAmount: number;
  couponCode?: string;
  giftMessage?: string;
  tracking?: {
    provider?: string;
    trackingId?: string;
    trackingUrl?: string;
  };
  timeline: IOrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

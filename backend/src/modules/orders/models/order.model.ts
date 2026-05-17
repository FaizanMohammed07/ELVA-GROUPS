import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'razorpay' | 'upi' | 'cod' | 'wallet' | 'card' | 'netbanking';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: string;
  title: string;
  slug: string;
  sku: string;
  thumbnail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  personalization?: Record<string, string>;
  isPersonalized: boolean;
}

export interface IOrder extends Document {
  id: string;
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount: number;
  shippingCost: number;
  tax: number;
  total: number;

  currency: string;

  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  tracking: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
  };

  timeline: Array<{
    status: OrderStatus;
    message: string;
    timestamp: Date;
    updatedBy?: string;
  }>;

  notes?: string;
  cancelReason?: string;
  returnReason?: string;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;

  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;

  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: String,
  title: { type: String, required: true },
  slug: { type: String, required: true },
  sku: { type: String, required: true },
  thumbnail: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  personalization: Schema.Types.Mixed,
  isPersonalized: { type: Boolean, default: false },
}, { _id: false });

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'upi', 'cod', 'wallet', 'card', 'netbanking'],
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: String,
    couponDiscount: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
      _id: false,
    },
    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      estimatedDelivery: Date,
      _id: false,
    },
    timeline: [
      {
        status: String,
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: String,
        _id: false,
      },
    ],
    notes: String,
    cancelReason: String,
    returnReason: String,
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: String,
    loyaltyPointsEarned: { type: Number, default: 0 },
    loyaltyPointsUsed: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });

OrderSchema.virtual('id').get(function () { return this._id.toHexString(); });

export const OrderModel: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);

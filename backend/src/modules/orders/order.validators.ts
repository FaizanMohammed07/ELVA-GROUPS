import { z } from 'zod';

const mongoId = z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid ID format');
const indianPhone = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');
const pincode = z.string().regex(/^\d{6}$/, 'Invalid pincode');

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: mongoId,
        quantity: z.number().int().min(1).max(99),
        variantId: z.string().max(100).optional(),
        personalization: z.record(z.string().max(50), z.string().max(300)).optional(),
      }),
    )
    .min(1, 'At least one item required')
    .max(20, 'Maximum 20 items per order'),

  shippingAddress: z.object({
    fullName: z.string().min(2).max(100).trim(),
    phone: indianPhone,
    line1: z.string().min(5).max(200).trim(),
    line2: z.string().max(200).trim().optional(),
    city: z.string().min(2).max(100).trim(),
    state: z.string().min(2).max(100).trim(),
    pincode,
    country: z.string().max(50).default('India'),
  }),

  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().max(50).optional(),
  giftMessage: z.string().max(500).trim().optional(),
  referenceNote: z.string().max(200).trim().optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).trim().optional(),
});

export const returnOrderSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason').max(500).trim(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending', 'confirmed', 'processing', 'packed',
    'shipped', 'delivered', 'cancelled', 'return_requested',
    'returned', 'refunded',
  ]),
  note: z.string().max(500).optional(),
});

export const updateTrackingSchema = z.object({
  trackingNumber: z.string().min(1).max(100).trim(),
  carrier: z.string().min(1).max(100).trim(),
  trackingUrl: z.string().url().optional(),
});

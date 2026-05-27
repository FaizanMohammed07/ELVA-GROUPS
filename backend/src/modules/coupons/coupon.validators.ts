import { z } from 'zod';

export const couponValidateSchema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.trim().toUpperCase()),
  orderTotal: z.number().min(0),
  shippingCost: z.number().min(0).optional().default(0),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric')
    .transform((v) => v.toUpperCase()),
  type: z.enum(['percentage', 'fixed', 'free_shipping', 'bxgy']),
  value: z.number().min(0).max(100000),
  description: z.string().max(300).optional(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  perUserLimit: z.number().int().min(1).optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

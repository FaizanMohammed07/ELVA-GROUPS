import { z } from 'zod';

const mongoId = z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid ID format');

export const addCartItemSchema = z.object({
  productId: mongoId,
  variantId: z.string().max(100).optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  personalization: z.record(z.string().max(50), z.string().max(300)).optional(),
  price: z.number().positive().optional(),       // server will re-verify from DB
  thumbnail: z.string().max(500).optional(),
  title: z.string().max(300).optional(),
  slug: z.string().max(200).optional(),
  stock: z.number().int().min(0).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(99),
  variantId: z.string().max(100).optional(),
});

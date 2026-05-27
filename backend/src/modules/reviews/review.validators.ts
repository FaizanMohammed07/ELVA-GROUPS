import { z } from 'zod';

const mongoId = z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid ID format');

export const createReviewSchema = z.object({
  productId: mongoId,
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).trim().optional(),
  body: z.string().max(2000).trim().optional(),
  images: z.array(z.string().url().max(500)).max(5).optional(),
  orderId: mongoId.optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).trim().optional(),
  body: z.string().max(2000).trim().optional(),
  images: z.array(z.string().url().max(500)).max(5).optional(),
});

export const reviewResponseSchema = z.object({
  body: z.string().min(1).max(1000).trim(),
});

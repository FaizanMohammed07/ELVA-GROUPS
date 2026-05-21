import { z } from 'zod';

const variantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  attributes: z.record(z.string()),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  stock: z.number().min(0).default(0),
  weight: z.number().optional(),
  images: z.array(z.string().url()).optional(),
  isDefault: z.boolean().default(false),
});

const personalizationFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'textarea', 'select', 'color', 'image']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  maxLength: z.number().optional(),
  placeholder: z.string().optional(),
});

export const productCreateSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(1).max(10000).default(''),
  shortDescription: z.string().max(500).optional(),
  sku: z.string().min(1),
  type: z.enum(['simple', 'variable', 'digital', 'subscription']).default('simple'),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  categoryIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).default([]),
  thumbnail: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  stock: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(5),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  weight: z.number().optional(),
  variants: z.array(variantSchema).optional().default([]),
  isPersonalizable: z.boolean().default(false),
  personalizationFields: z.array(personalizationFieldSchema).optional().default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isLimitedEdition: z.boolean().default(false),
  collections: z.array(z.string()).optional().default([]),
  vendor: z.string().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().optional(),
    })
    .optional(),
  shippingInfo: z
    .object({
      isFreeShipping: z.boolean().default(false),
      estimatedDays: z.number().default(5),
      shipsFrom: z.string().default('India'),
    })
    .optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(500).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['price', 'rating', 'salesCount', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isPersonalizable: z.coerce.boolean().optional(),
  collections: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived', 'out_of_stock', 'all']).optional(),
});

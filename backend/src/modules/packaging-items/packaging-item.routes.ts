import { Router, Request, Response } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import { authenticate } from '../../middleware/authenticate';
import { requireSuperAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { z } from 'zod';

// ─── Inline Model ───────────────────────────────────────────────────────────

interface IPackagingItem extends Document {
  id: string;
  name: string;
  type: string;
  costPerUnit: number;
  unit: string;
  supplierId?: mongoose.Types.ObjectId;
  supplierName?: string;
  currentStock: number;
  reorderPoint: number;
  brandingType: 'logo-printed' | 'plain' | 'custom' | 'eco';
  premiumScore: number;
  isReusable: boolean;
  isActive: boolean;
}

const PackagingItemSchema = new Schema<IPackagingItem>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['honeycomb-paper', 'shredded-paper', 'custom-box', 'sticker', 'thank-you-card',
        'premium-ribbon', 'magnetic-box', 'protective-wrap', 'glass-protection',
        'eco-packaging', 'luxury-packaging', 'tissue-paper', 'tape', 'label', 'other'],
      required: true,
    },
    costPerUnit: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'pcs' },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierName: { type: String },
    currentStock: { type: Number, default: 0 },
    reorderPoint: { type: Number, default: 50 },
    brandingType: {
      type: String,
      enum: ['logo-printed', 'plain', 'custom', 'eco'],
      default: 'plain',
    },
    premiumScore: { type: Number, min: 1, max: 10, default: 5 },
    isReusable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);
PackagingItemSchema.virtual('id').get(function () { return this._id.toHexString(); });

const PackagingItemModel = mongoose.models['PackagingItem'] ||
  mongoose.model<IPackagingItem>('PackagingItem', PackagingItemSchema);

// ─── Routes ─────────────────────────────────────────────────────────────────

export const packagingItemRouter = Router();
packagingItemRouter.use(authenticate, requireSuperAdmin);

const schema = z.object({
  name: z.string().min(1),
  type: z.string(),
  costPerUnit: z.number().min(0),
  unit: z.string().default('pcs'),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  currentStock: z.number().min(0).default(0),
  reorderPoint: z.number().min(0).default(50),
  brandingType: z.enum(['logo-printed', 'plain', 'custom', 'eco']).default('plain'),
  premiumScore: z.number().min(1).max(10).default(5),
  isReusable: z.boolean().default(false),
});

packagingItemRouter.get('/', async (_req: Request, res: Response) => {
  const items = await PackagingItemModel.find({ isActive: true }).sort({ type: 1, name: 1 });
  sendSuccess(res, items, 'Packaging items fetched');
});

packagingItemRouter.post('/', async (req: Request, res: Response) => {
  const body = schema.parse(req.body);
  const item = await PackagingItemModel.create(body);
  sendCreated(res, item, 'Packaging item created');
});

packagingItemRouter.put('/:id', async (req: Request, res: Response) => {
  const body = schema.partial().parse(req.body);
  const item = await PackagingItemModel.findByIdAndUpdate(req.params['id'], body, { new: true });
  if (!item) throw AppError.notFound('Item not found');
  sendSuccess(res, item, 'Item updated');
});

packagingItemRouter.delete('/:id', async (req: Request, res: Response) => {
  await PackagingItemModel.findByIdAndUpdate(req.params['id'], { isActive: false });
  sendSuccess(res, null, 'Item deactivated');
});

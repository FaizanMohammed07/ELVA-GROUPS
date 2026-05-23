import { Router, Request, Response } from 'express';
import mongoose, { Schema, Document, Model } from 'mongoose';
import { authenticate } from '../../middleware/authenticate';
import { requireSuperAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';

// ── Model ─────────────────────────────────────────────────────────────────────

interface ITemplateMaterial {
  name: string;
  unit: string;
  defaultQty: number;
  estimatedCost: number;
  wastagePercent: number;
  notes?: string;
}

interface ITemplateGroup {
  name: string;
  materials: ITemplateMaterial[];
}

export interface IMaterialTemplate extends Document {
  id: string;
  categorySlug: string;
  categoryName: string;
  description?: string;
  groups: ITemplateGroup[];
  estimatedLaborMinutes: number;
  estimatedOverheadPercent: number;
  isActive: boolean;
  isSeeded: boolean;
}

const TemplateMaterialSchema = new Schema<ITemplateMaterial>({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  defaultQty: { type: Number, required: true, min: 0 },
  estimatedCost: { type: Number, required: true, min: 0 },
  wastagePercent: { type: Number, default: 5, min: 0, max: 100 },
  notes: String,
}, { _id: false });

const TemplateGroupSchema = new Schema<ITemplateGroup>({
  name: { type: String, required: true },
  materials: [TemplateMaterialSchema],
}, { _id: false });

const MaterialTemplateSchema = new Schema<IMaterialTemplate>(
  {
    categorySlug: { type: String, required: true, unique: true, lowercase: true, index: true },
    categoryName: { type: String, required: true },
    description: String,
    groups: [TemplateGroupSchema],
    estimatedLaborMinutes: { type: Number, default: 30 },
    estimatedOverheadPercent: { type: Number, default: 15 },
    isActive: { type: Boolean, default: true },
    isSeeded: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

MaterialTemplateSchema.virtual('id').get(function () { return this._id.toHexString(); });

const MaterialTemplateModel: Model<IMaterialTemplate> =
  mongoose.models['MaterialTemplate'] ||
  mongoose.model<IMaterialTemplate>('MaterialTemplate', MaterialTemplateSchema);

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_TEMPLATES = [
  {
    categorySlug: 'candles',
    categoryName: 'Candles',
    description: 'Scented, decorative and container candles',
    estimatedLaborMinutes: 45,
    estimatedOverheadPercent: 15,
    groups: [
      {
        name: 'Wax',
        materials: [
          { name: 'Soy Wax', unit: 'kg', defaultQty: 0.15, estimatedCost: 350, wastagePercent: 5 },
          { name: 'Paraffin Wax', unit: 'kg', defaultQty: 0.15, estimatedCost: 180, wastagePercent: 5 },
          { name: 'Beeswax', unit: 'kg', defaultQty: 0.15, estimatedCost: 800, wastagePercent: 3 },
          { name: 'Coconut Wax', unit: 'kg', defaultQty: 0.15, estimatedCost: 480, wastagePercent: 5 },
          { name: 'Gel Wax', unit: 'kg', defaultQty: 0.12, estimatedCost: 290, wastagePercent: 8 },
        ],
      },
      {
        name: 'Wicks',
        materials: [
          { name: 'Cotton Wick', unit: 'pcs', defaultQty: 1, estimatedCost: 8, wastagePercent: 0 },
          { name: 'Wooden Wick', unit: 'pcs', defaultQty: 1, estimatedCost: 18, wastagePercent: 0 },
          { name: 'Hemp Wick', unit: 'pcs', defaultQty: 1, estimatedCost: 12, wastagePercent: 0 },
        ],
      },
      {
        name: 'Fragrance & Colour',
        materials: [
          { name: 'Fragrance Oil — Vanilla', unit: 'ml', defaultQty: 15, estimatedCost: 3.5, wastagePercent: 3 },
          { name: 'Fragrance Oil — Rose', unit: 'ml', defaultQty: 15, estimatedCost: 4, wastagePercent: 3 },
          { name: 'Fragrance Oil — Lavender', unit: 'ml', defaultQty: 15, estimatedCost: 3.8, wastagePercent: 3 },
          { name: 'Fragrance Oil — Sandalwood', unit: 'ml', defaultQty: 15, estimatedCost: 5, wastagePercent: 3 },
          { name: 'Liquid Dye / Pigment', unit: 'ml', defaultQty: 2, estimatedCost: 8, wastagePercent: 5 },
          { name: 'Candle Colourant Block', unit: 'g', defaultQty: 3, estimatedCost: 6, wastagePercent: 5 },
        ],
      },
      {
        name: 'Container',
        materials: [
          { name: 'Glass Jar (200ml)', unit: 'pcs', defaultQty: 1, estimatedCost: 45, wastagePercent: 2 },
          { name: 'Tin Container', unit: 'pcs', defaultQty: 1, estimatedCost: 30, wastagePercent: 2 },
          { name: 'Ceramic Jar', unit: 'pcs', defaultQty: 1, estimatedCost: 80, wastagePercent: 3 },
          { name: 'Concrete Vessel', unit: 'pcs', defaultQty: 1, estimatedCost: 120, wastagePercent: 5 },
        ],
      },
      {
        name: 'Add-ons & Finishing',
        materials: [
          { name: 'Dried Flowers', unit: 'g', defaultQty: 5, estimatedCost: 12, wastagePercent: 10 },
          { name: 'Glitter', unit: 'g', defaultQty: 3, estimatedCost: 5, wastagePercent: 10 },
          { name: 'Warning Sticker', unit: 'pcs', defaultQty: 1, estimatedCost: 2, wastagePercent: 0 },
          { name: 'Dust Cover / Lid', unit: 'pcs', defaultQty: 1, estimatedCost: 8, wastagePercent: 2 },
        ],
      },
      {
        name: 'Packaging',
        materials: [
          { name: 'Kraft Box', unit: 'pcs', defaultQty: 1, estimatedCost: 25, wastagePercent: 2 },
          { name: 'Honeycomb Wrap', unit: 'pcs', defaultQty: 1, estimatedCost: 12, wastagePercent: 5 },
          { name: 'Shredded Paper Filler', unit: 'g', defaultQty: 30, estimatedCost: 0.5, wastagePercent: 10 },
          { name: 'Thank You Card', unit: 'pcs', defaultQty: 1, estimatedCost: 6, wastagePercent: 2 },
          { name: 'Premium Ribbon', unit: 'pcs', defaultQty: 1, estimatedCost: 15, wastagePercent: 5 },
        ],
      },
    ],
  },
  {
    categorySlug: 'clay-art',
    categoryName: 'Clay Art',
    description: 'Handcrafted clay figurines, jewellery and decorative pieces',
    estimatedLaborMinutes: 90,
    estimatedOverheadPercent: 12,
    groups: [
      {
        name: 'Clay',
        materials: [
          { name: 'Air Dry Clay', unit: 'g', defaultQty: 150, estimatedCost: 0.8, wastagePercent: 8 },
          { name: 'Polymer Clay', unit: 'g', defaultQty: 100, estimatedCost: 2.2, wastagePercent: 6 },
          { name: 'Resin Clay', unit: 'g', defaultQty: 80, estimatedCost: 3.5, wastagePercent: 5 },
        ],
      },
      {
        name: 'Coloring & Finishing',
        materials: [
          { name: 'Acrylic Paint Set', unit: 'ml', defaultQty: 10, estimatedCost: 4, wastagePercent: 10 },
          { name: 'Pigment Powder', unit: 'g', defaultQty: 5, estimatedCost: 15, wastagePercent: 8 },
          { name: 'Gloss Varnish', unit: 'ml', defaultQty: 8, estimatedCost: 3, wastagePercent: 5 },
          { name: 'Matte Sealant', unit: 'ml', defaultQty: 8, estimatedCost: 3, wastagePercent: 5 },
          { name: 'Resin Coating', unit: 'ml', defaultQty: 15, estimatedCost: 8, wastagePercent: 8 },
        ],
      },
      {
        name: 'Tools & Consumables',
        materials: [
          { name: 'Baking Paper', unit: 'pcs', defaultQty: 2, estimatedCost: 1.5, wastagePercent: 0 },
          { name: 'Sandpaper (fine)', unit: 'pcs', defaultQty: 1, estimatedCost: 5, wastagePercent: 50 },
        ],
      },
      {
        name: 'Packaging',
        materials: [
          { name: 'Bubble Wrap', unit: 'pcs', defaultQty: 1, estimatedCost: 8, wastagePercent: 5 },
          { name: 'Foam Insert', unit: 'pcs', defaultQty: 1, estimatedCost: 12, wastagePercent: 5 },
          { name: 'Kraft Gift Box', unit: 'pcs', defaultQty: 1, estimatedCost: 30, wastagePercent: 2 },
          { name: 'Thank You Card', unit: 'pcs', defaultQty: 1, estimatedCost: 6, wastagePercent: 2 },
        ],
      },
    ],
  },
  {
    categorySlug: 'resin-art',
    categoryName: 'Resin Art',
    description: 'Epoxy resin trays, coasters, jewellery and décor',
    estimatedLaborMinutes: 60,
    estimatedOverheadPercent: 18,
    groups: [
      {
        name: 'Resin',
        materials: [
          { name: 'Epoxy Resin — Part A', unit: 'ml', defaultQty: 100, estimatedCost: 1.8, wastagePercent: 10 },
          { name: 'Epoxy Resin — Part B (Hardener)', unit: 'ml', defaultQty: 50, estimatedCost: 1.5, wastagePercent: 10 },
          { name: 'UV Resin', unit: 'ml', defaultQty: 20, estimatedCost: 4, wastagePercent: 8 },
        ],
      },
      {
        name: 'Colouring & Inclusions',
        materials: [
          { name: 'Mica Powder / Pigment', unit: 'g', defaultQty: 5, estimatedCost: 20, wastagePercent: 10 },
          { name: 'Alcohol Ink', unit: 'ml', defaultQty: 3, estimatedCost: 12, wastagePercent: 8 },
          { name: 'Glitter', unit: 'g', defaultQty: 5, estimatedCost: 5, wastagePercent: 15 },
          { name: 'Dried Flowers', unit: 'g', defaultQty: 3, estimatedCost: 12, wastagePercent: 10 },
          { name: 'Gold Leaf / Foil', unit: 'pcs', defaultQty: 2, estimatedCost: 10, wastagePercent: 20 },
        ],
      },
      {
        name: 'Molds & Bases',
        materials: [
          { name: 'Silicone Mold', unit: 'pcs', defaultQty: 1, estimatedCost: 0, notes: 'Reusable — amortise cost', wastagePercent: 0 },
          { name: 'MDF / Wood Tray Base', unit: 'pcs', defaultQty: 1, estimatedCost: 80, wastagePercent: 3 },
        ],
      },
      {
        name: 'Packaging',
        materials: [
          { name: 'Bubble Wrap', unit: 'pcs', defaultQty: 1, estimatedCost: 10, wastagePercent: 5 },
          { name: 'Premium Box', unit: 'pcs', defaultQty: 1, estimatedCost: 50, wastagePercent: 2 },
          { name: 'Thank You Card', unit: 'pcs', defaultQty: 1, estimatedCost: 6, wastagePercent: 2 },
        ],
      },
    ],
  },
  {
    categorySlug: 'hampers',
    categoryName: 'Hampers & Gift Sets',
    description: 'Curated gift hampers and gift boxes',
    estimatedLaborMinutes: 30,
    estimatedOverheadPercent: 12,
    groups: [
      {
        name: 'Box & Tray',
        materials: [
          { name: 'Magnetic Gift Box (large)', unit: 'pcs', defaultQty: 1, estimatedCost: 120, wastagePercent: 2 },
          { name: 'Wooden Tray / Crate', unit: 'pcs', defaultQty: 1, estimatedCost: 180, wastagePercent: 3 },
          { name: 'Kraft Hamper Box', unit: 'pcs', defaultQty: 1, estimatedCost: 60, wastagePercent: 2 },
        ],
      },
      {
        name: 'Filler & Protection',
        materials: [
          { name: 'Shredded Paper Filler', unit: 'g', defaultQty: 80, estimatedCost: 0.5, wastagePercent: 15 },
          { name: 'Tissue Paper', unit: 'pcs', defaultQty: 3, estimatedCost: 4, wastagePercent: 5 },
          { name: 'Honeycomb Wrap', unit: 'pcs', defaultQty: 2, estimatedCost: 12, wastagePercent: 5 },
        ],
      },
      {
        name: 'Branding & Finishing',
        materials: [
          { name: 'Logo Sticker / Seal', unit: 'pcs', defaultQty: 2, estimatedCost: 5, wastagePercent: 5 },
          { name: 'Ribbon / Raffia', unit: 'pcs', defaultQty: 1, estimatedCost: 20, wastagePercent: 5 },
          { name: 'Thank You / Gift Card', unit: 'pcs', defaultQty: 1, estimatedCost: 10, wastagePercent: 2 },
          { name: 'Custom Tag', unit: 'pcs', defaultQty: 1, estimatedCost: 8, wastagePercent: 2 },
        ],
      },
    ],
  },
  {
    categorySlug: 'jewelry',
    categoryName: 'Handcrafted Jewelry',
    description: 'Resin, clay and macramé jewellery',
    estimatedLaborMinutes: 75,
    estimatedOverheadPercent: 14,
    groups: [
      {
        name: 'Base Materials',
        materials: [
          { name: 'Polymer Clay', unit: 'g', defaultQty: 20, estimatedCost: 2.2, wastagePercent: 8 },
          { name: 'Epoxy Resin', unit: 'ml', defaultQty: 10, estimatedCost: 1.8, wastagePercent: 10 },
          { name: 'Wire (silver-tone)', unit: 'm', defaultQty: 0.5, estimatedCost: 30, wastagePercent: 10 },
        ],
      },
      {
        name: 'Hardware & Findings',
        materials: [
          { name: 'Earring Hooks (pair)', unit: 'pcs', defaultQty: 1, estimatedCost: 8, wastagePercent: 5 },
          { name: 'Ring Base', unit: 'pcs', defaultQty: 1, estimatedCost: 12, wastagePercent: 3 },
          { name: 'Necklace Chain', unit: 'pcs', defaultQty: 1, estimatedCost: 25, wastagePercent: 2 },
          { name: 'Jump Rings', unit: 'pcs', defaultQty: 4, estimatedCost: 1, wastagePercent: 10 },
        ],
      },
      {
        name: 'Finishing',
        materials: [
          { name: 'Resin Gloss Coat', unit: 'ml', defaultQty: 3, estimatedCost: 8, wastagePercent: 8 },
          { name: 'Pigment / Mica', unit: 'g', defaultQty: 2, estimatedCost: 20, wastagePercent: 10 },
        ],
      },
      {
        name: 'Packaging',
        materials: [
          { name: 'Jewellery Box', unit: 'pcs', defaultQty: 1, estimatedCost: 20, wastagePercent: 2 },
          { name: 'Velvet Pouch', unit: 'pcs', defaultQty: 1, estimatedCost: 15, wastagePercent: 3 },
          { name: 'Thank You Card', unit: 'pcs', defaultQty: 1, estimatedCost: 6, wastagePercent: 2 },
        ],
      },
    ],
  },
  {
    categorySlug: 'decor',
    categoryName: 'Home Décor',
    description: 'Handcrafted decorative items for home',
    estimatedLaborMinutes: 60,
    estimatedOverheadPercent: 15,
    groups: [
      {
        name: 'Primary Material',
        materials: [
          { name: 'Air Dry Clay', unit: 'g', defaultQty: 200, estimatedCost: 0.8, wastagePercent: 10 },
          { name: 'Macramé Cord', unit: 'm', defaultQty: 5, estimatedCost: 18, wastagePercent: 8 },
          { name: 'Wood Base', unit: 'pcs', defaultQty: 1, estimatedCost: 60, wastagePercent: 3 },
        ],
      },
      {
        name: 'Finishing & Coatings',
        materials: [
          { name: 'Acrylic Paint', unit: 'ml', defaultQty: 20, estimatedCost: 4, wastagePercent: 10 },
          { name: 'Gold / Silver Leaf', unit: 'pcs', defaultQty: 3, estimatedCost: 10, wastagePercent: 15 },
          { name: 'Varnish / Sealant', unit: 'ml', defaultQty: 10, estimatedCost: 3, wastagePercent: 5 },
        ],
      },
      {
        name: 'Packaging',
        materials: [
          { name: 'Bubble Wrap', unit: 'pcs', defaultQty: 1, estimatedCost: 10, wastagePercent: 5 },
          { name: 'Kraft Box', unit: 'pcs', defaultQty: 1, estimatedCost: 35, wastagePercent: 2 },
          { name: 'Thank You Card', unit: 'pcs', defaultQty: 1, estimatedCost: 6, wastagePercent: 2 },
        ],
      },
    ],
  },
];

// ── Seeder ────────────────────────────────────────────────────────────────────

export async function seedMaterialTemplates(): Promise<void> {
  for (const tpl of SEED_TEMPLATES) {
    await MaterialTemplateModel.findOneAndUpdate(
      { categorySlug: tpl.categorySlug },
      { ...tpl, isSeeded: true },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

export const materialTemplateRouter = Router();
materialTemplateRouter.use(authenticate, requireSuperAdmin);

// List all
materialTemplateRouter.get('/', async (_req: Request, res: Response) => {
  const templates = await MaterialTemplateModel.find({ isActive: true })
    .select('categorySlug categoryName description estimatedLaborMinutes estimatedOverheadPercent groups')
    .sort({ categoryName: 1 });
  sendSuccess(res, templates, 'Templates fetched');
});

// Get by category slug — used by costing engine auto-load
materialTemplateRouter.get('/by-category/:slug', async (req: Request, res: Response) => {
  const slug = String(req.params['slug']).toLowerCase();
  const template = await MaterialTemplateModel.findOne({
    categorySlug: slug,
    isActive: true,
  });
  if (!template) throw AppError.notFound('No template for this category');
  sendSuccess(res, template, 'Template fetched');
});

// Get single
materialTemplateRouter.get('/:id', async (req: Request, res: Response) => {
  const template = await MaterialTemplateModel.findById(req.params['id']);
  if (!template) throw AppError.notFound('Template not found');
  sendSuccess(res, template, 'Template fetched');
});

// Create
materialTemplateRouter.post('/', async (req: Request, res: Response) => {
  const existing = await MaterialTemplateModel.findOne({ categorySlug: req.body.categorySlug });
  if (existing) throw AppError.conflict('Template for this category already exists');
  const template = await MaterialTemplateModel.create(req.body);
  sendCreated(res, template, 'Template created');
});

// Update
materialTemplateRouter.put('/:id', async (req: Request, res: Response) => {
  const template = await MaterialTemplateModel.findByIdAndUpdate(
    req.params['id'],
    req.body,
    { new: true, runValidators: true },
  );
  if (!template) throw AppError.notFound('Template not found');
  sendSuccess(res, template, 'Template updated');
});

// Seed defaults
materialTemplateRouter.post('/seed', async (_req: Request, res: Response) => {
  await seedMaterialTemplates();
  sendSuccess(res, null, `Seeded ${SEED_TEMPLATES.length} templates`);
});

// Delete
materialTemplateRouter.delete('/:id', async (req: Request, res: Response) => {
  await MaterialTemplateModel.findByIdAndUpdate(req.params['id'], { isActive: false });
  sendSuccess(res, null, 'Template deactivated');
});

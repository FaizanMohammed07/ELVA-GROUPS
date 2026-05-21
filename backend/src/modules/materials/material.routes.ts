import { Router, Request, Response } from 'express';
import { MaterialModel } from './models/material.model';
import { authenticate } from '../../middleware/authenticate';
import { requireSuperAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { z } from 'zod';

export const materialRouter = Router();
materialRouter.use(authenticate, requireSuperAdmin);

const materialSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(50),
  category: z.enum(['wax', 'wick', 'fragrance', 'dye', 'clay', 'paper', 'fabric', 'metal', 'glass', 'packaging', 'chemical', 'other']),
  unit: z.enum(['g', 'kg', 'ml', 'L', 'pcs', 'm', 'cm', 'sqft']),
  costPerUnit: z.number().min(0),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  currentStock: z.number().min(0).default(0),
  reorderPoint: z.number().min(0).default(0),
  minOrderQty: z.number().min(1).default(1),
  wastagePercent: z.number().min(0).max(100).default(0),
  leadTimeDays: z.number().min(0).default(7),
});

materialRouter.get('/', async (req: Request, res: Response) => {
  const { category, search, lowStock } = req.query;
  const filter: any = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (lowStock === 'true') filter.$expr = { $lte: ['$currentStock', '$reorderPoint'] };

  const materials = await MaterialModel.find(filter)
    .populate('supplierId', 'name contactPerson phone')
    .sort({ category: 1, name: 1 });
  sendSuccess(res, materials, 'Materials fetched');
});

materialRouter.get('/low-stock', async (_req: Request, res: Response) => {
  const materials = await MaterialModel.find({
    isActive: true,
    $expr: { $lte: ['$currentStock', '$reorderPoint'] },
  }).select('name sku category unit currentStock reorderPoint supplierName leadTimeDays');
  sendSuccess(res, materials, 'Low stock materials');
});

materialRouter.get('/:id', async (req: Request, res: Response) => {
  const material = await MaterialModel.findById(req.params['id']).populate('supplierId');
  if (!material) throw AppError.notFound('Material not found');
  sendSuccess(res, material, 'Material fetched');
});

materialRouter.post('/', async (req: Request, res: Response) => {
  const body = materialSchema.parse(req.body);
  const existing = await MaterialModel.findOne({ sku: body.sku.toUpperCase() });
  if (existing) throw AppError.conflict('SKU already exists');
  const material = await MaterialModel.create({
    ...body,
    priceHistory: [{ cost: body.costPerUnit, date: new Date(), note: 'Initial price' }],
  });
  sendCreated(res, material, 'Material created');
});

materialRouter.put('/:id', async (req: Request, res: Response) => {
  const body = materialSchema.partial().parse(req.body);
  const material = await MaterialModel.findById(req.params['id']);
  if (!material) throw AppError.notFound('Material not found');

  if (body.costPerUnit && body.costPerUnit !== material.costPerUnit) {
    material.priceHistory.push({ cost: body.costPerUnit, date: new Date(), note: req.body.priceNote });
  }
  Object.assign(material, body);
  await material.save();
  sendSuccess(res, material, 'Material updated');
});

materialRouter.patch('/:id/stock', async (req: Request, res: Response) => {
  const { adjustment, note } = req.body;
  if (typeof adjustment !== 'number') throw AppError.badRequest('adjustment must be a number');
  const material = await MaterialModel.findByIdAndUpdate(
    req.params['id'],
    { $inc: { currentStock: adjustment } },
    { new: true },
  );
  if (!material) throw AppError.notFound('Material not found');
  sendSuccess(res, material, `Stock adjusted by ${adjustment > 0 ? '+' : ''}${adjustment}`);
});

materialRouter.delete('/:id', async (req: Request, res: Response) => {
  await MaterialModel.findByIdAndUpdate(req.params['id'], { isActive: false });
  sendSuccess(res, null, 'Material deactivated');
});

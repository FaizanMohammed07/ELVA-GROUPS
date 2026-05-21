import { Router, Request, Response } from 'express';
import { SupplierModel } from './models/supplier.model';
import { MaterialModel } from '../materials/models/material.model';
import { authenticate } from '../../middleware/authenticate';
import { requireSuperAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { z } from 'zod';

export const supplierRouter = Router();
supplierRouter.use(authenticate, requireSuperAdmin);

const supplierSchema = z.object({
  name: z.string().min(1).max(200),
  contactPerson: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(7).max(20),
  address: z.string().optional(),
  city: z.string().optional(),
  category: z.enum(['raw-material', 'packaging', 'both', 'other']).default('raw-material'),
  paymentTerms: z.enum(['advance', 'cod', 'net15', 'net30', 'net60']).default('cod'),
  leadTimeDays: z.number().min(0).default(7),
  rating: z.number().min(1).max(5).default(3),
  notes: z.string().optional(),
});

supplierRouter.get('/', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  const filter: any = { isActive: true };
  if (category) filter.category = category;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { city: { $regex: search, $options: 'i' } },
  ];
  const suppliers = await SupplierModel.find(filter).sort({ name: 1 });
  sendSuccess(res, suppliers, 'Suppliers fetched');
});

supplierRouter.get('/:id', async (req: Request, res: Response) => {
  const supplier = await SupplierModel.findById(req.params['id']);
  if (!supplier) throw AppError.notFound('Supplier not found');
  const materials = await MaterialModel.find({ supplierId: supplier._id, isActive: true })
    .select('name sku category unit costPerUnit currentStock');
  sendSuccess(res, { supplier, materials }, 'Supplier details');
});

supplierRouter.post('/', async (req: Request, res: Response) => {
  const body = supplierSchema.parse(req.body);
  const supplier = await SupplierModel.create(body);
  sendCreated(res, supplier, 'Supplier created');
});

supplierRouter.put('/:id', async (req: Request, res: Response) => {
  const body = supplierSchema.partial().parse(req.body);
  const supplier = await SupplierModel.findByIdAndUpdate(req.params['id'], body, { new: true });
  if (!supplier) throw AppError.notFound('Supplier not found');
  sendSuccess(res, supplier, 'Supplier updated');
});

supplierRouter.delete('/:id', async (req: Request, res: Response) => {
  await SupplierModel.findByIdAndUpdate(req.params['id'], { isActive: false });
  sendSuccess(res, null, 'Supplier deactivated');
});

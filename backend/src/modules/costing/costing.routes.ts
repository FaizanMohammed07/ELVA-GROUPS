import { Router, Request, Response } from 'express';
import { ProductCostingModel } from './models/product-costing.model';
import { ProductModel } from '../products/models/product.model';
import { authenticate } from '../../middleware/authenticate';
import { requireSuperAdmin } from '../../middleware/authorize';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { computeCosting, computeMaterialLine } from './costing.service';

export const costingRouter = Router();
costingRouter.use(authenticate, requireSuperAdmin);

/** Real-time calculation — no DB write */
costingRouter.post('/calculate', async (req: Request, res: Response) => {
  const computed = computeCosting(req.body);
  sendSuccess(res, computed, 'Calculated');
});

/** Compute a single material line cost */
costingRouter.post('/calculate/material-line', async (req: Request, res: Response) => {
  const { quantity, costPerUnit, wastagePercent } = req.body;
  const totalCost = computeMaterialLine(
    Number(quantity) || 0,
    Number(costPerUnit) || 0,
    Number(wastagePercent) || 0,
  );
  sendSuccess(res, { totalCost }, 'Line cost');
});

/** List all product costings (summary) */
costingRouter.get('/', async (req: Request, res: Response) => {
  const { search } = req.query;
  const filter: any = { isActive: true };
  if (search) filter.productTitle = { $regex: search, $options: 'i' };

  const costings = await ProductCostingModel.find(filter)
    .select('productId productTitle productSku currentSellingPrice trueProductionCost totalTrueCost grossMarginPercent netMarginPercent roi complexityLevel version updatedAt')
    .sort({ updatedAt: -1 });
  sendSuccess(res, costings, 'Product costings');
});

/** Profit intelligence: sorted by margin, with recommendations */
costingRouter.get('/profit-intelligence', async (_req: Request, res: Response) => {
  const costings = await ProductCostingModel.find({ isActive: true })
    .select('productTitle productSku currentSellingPrice trueProductionCost totalTrueCost grossProfitAmount grossMarginPercent netProfitAmount netMarginPercent roi suggestedPrice totalMaterialCost totalLaborCost totalPackagingCost complexityLevel')
    .sort({ netMarginPercent: -1 });

  const withFlags = costings.map((c) => ({
    ...c.toJSON(),
    flag: c.netMarginPercent < 10 ? 'critical' :
          c.netMarginPercent < 25 ? 'warning' :
          c.netMarginPercent > 55 ? 'excellent' : 'healthy',
    underpriced: c.currentSellingPrice < c.suggestedPrice,
    gapToSuggested: c.suggestedPrice - c.currentSellingPrice,
  }));

  sendSuccess(res, withFlags, 'Profit intelligence');
});

/** Cost breakdown summary for CFO */
costingRouter.get('/cfo-breakdown', async (_req: Request, res: Response) => {
  const costings = await ProductCostingModel.find({ isActive: true });
  if (!costings.length) { sendSuccess(res, {}, 'No data'); return; }

  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;

  const breakdown = {
    avgMaterialPercent: avg(costings.map(c => c.trueProductionCost > 0 ? (c.totalMaterialCost / c.trueProductionCost) * 100 : 0)),
    avgLaborPercent: avg(costings.map(c => c.trueProductionCost > 0 ? (c.totalLaborCost / c.trueProductionCost) * 100 : 0)),
    avgPackagingPercent: avg(costings.map(c => c.trueProductionCost > 0 ? (c.totalPackagingCost / c.trueProductionCost) * 100 : 0)),
    avgNetMargin: avg(costings.map(c => c.netMarginPercent)),
    avgGrossMargin: avg(costings.map(c => c.grossMarginPercent)),
    totalProducts: costings.length,
    underpricedProducts: costings.filter(c => c.currentSellingPrice < c.suggestedPrice).length,
    criticalMarginProducts: costings.filter(c => c.netMarginPercent < 10).length,
  };
  sendSuccess(res, breakdown, 'CFO breakdown');
});

/** Get costing for a specific product */
costingRouter.get('/product/:productId', async (req: Request, res: Response) => {
  const costing = await ProductCostingModel.findOne({
    productId: req.params['productId'],
    isActive: true,
  }).populate('materials.materialId', 'name sku unit').populate('packagingItems.packagingItemId', 'name type');
  sendSuccess(res, costing || null, 'Product costing');
});

/** Get single costing record */
costingRouter.get('/:id', async (req: Request, res: Response) => {
  const costing = await ProductCostingModel.findById(req.params['id']);
  if (!costing) throw AppError.notFound('Costing not found');
  sendSuccess(res, costing, 'Costing fetched');
});

/** Create or update product costing */
costingRouter.post('/', async (req: Request, res: Response) => {
  const body = req.body;

  if (!body.productId) throw AppError.badRequest('productId is required');

  const product = await ProductModel.findById(body.productId).select('title sku price');
  if (!product) throw AppError.notFound('Product not found');

  // Compute all derived fields
  const computed = computeCosting(body);
  const payload = {
    ...body,
    ...computed,
    productTitle: product.title,
    productSku: product.sku,
    currentSellingPrice: body.currentSellingPrice ?? product.price ?? 0,
  };

  // Upsert: one costing record per product
  const existing = await ProductCostingModel.findOne({ productId: body.productId, isActive: true });
  if (existing) {
    payload.version = (existing.version || 1) + 1;
    Object.assign(existing, payload);
    await existing.save();
    sendSuccess(res, existing, 'Costing updated');
  } else {
    const costing = await ProductCostingModel.create(payload);
    sendCreated(res, costing, 'Costing created');
  }
});

costingRouter.delete('/:id', async (req: Request, res: Response) => {
  await ProductCostingModel.findByIdAndUpdate(req.params['id'], { isActive: false });
  sendSuccess(res, null, 'Costing archived');
});

import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { sendSuccess, buildPaginationMeta } from '../../utils/apiResponse';
import { ProductModel } from '../products/models/product.model';

export const inventoryRouter = Router();

inventoryRouter.use(authenticate, requireAdmin);

inventoryRouter.get('/summary', async (_req, res) => {
  const [total, active, outOfStock, lowStock] = await Promise.all([
    ProductModel.countDocuments(),
    ProductModel.countDocuments({ status: 'active' }),
    ProductModel.countDocuments({ stock: 0, status: 'active' }),
    ProductModel.countDocuments({ status: 'active', $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
  ]);
  sendSuccess(res, { total, active, outOfStock, lowStock }, 'Inventory summary');
});

inventoryRouter.get('/products', async (req, res) => {
  const tab = String(req.query.tab || 'all');
  const search = req.query.search ? String(req.query.search) : null;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (tab === 'low') {
    filter.trackInventory = true;
    filter.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] };
  } else if (tab === 'out') {
    filter.stock = { $lte: 0 };
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .select('title sku stock lowStockThreshold status thumbnail categoryIds')
      .populate('categoryIds', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ stock: 1 }),
    ProductModel.countDocuments(filter),
  ]);

  const meta = buildPaginationMeta(total, page, limit);
  sendSuccess(res, products, 'Inventory products', 200, meta);
});

inventoryRouter.patch('/:id/adjust', async (req, res) => {
  const { quantity, note: _note } = req.body;
  await ProductModel.findByIdAndUpdate(req.params["id"], { $set: { stock: Number(quantity) } });
  sendSuccess(res, null, 'Stock adjusted');
});

inventoryRouter.get('/low-stock', async (_req, res) => {
  const products = await ProductModel.find({
    status: 'active',
    trackInventory: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
  }).select('title sku stock lowStockThreshold thumbnail');
  sendSuccess(res, products, 'Low stock products');
});

inventoryRouter.get('/out-of-stock', async (_req, res) => {
  const products = await ProductModel.find({ status: 'active', stock: 0 })
    .select('title sku thumbnail');
  sendSuccess(res, products, 'Out of stock products');
});

inventoryRouter.patch('/:id/stock', async (req, res) => {
  const { quantity, operation } = req.body;
  const inc = operation === 'set' ? undefined : (operation === 'decrement' ? -quantity : quantity);
  const update = operation === 'set' ? { $set: { stock: quantity } } : { $inc: { stock: inc } };
  await ProductModel.findByIdAndUpdate(req.params["id"] as string, update);
  sendSuccess(res, null, 'Stock updated');
});

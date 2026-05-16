import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { sendSuccess } from '../../utils/apiResponse';
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
  await ProductModel.findByIdAndUpdate(req.params.id, update);
  sendSuccess(res, null, 'Stock updated');
});

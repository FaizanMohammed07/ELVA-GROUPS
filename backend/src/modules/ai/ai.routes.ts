import { Router } from 'express';
import { optionalAuthenticate } from '../../middleware/authenticate';
import { sendSuccess } from '../../utils/apiResponse';
import { ProductRepository } from '../products/repositories/product.repository';

const productRepo = new ProductRepository();
export const aiRouter = Router();

aiRouter.use(optionalAuthenticate);

aiRouter.get('/recommendations', async (req: any, res) => {
  const products = await productRepo.findFeatured(8);
  sendSuccess(res, products, 'AI recommendations (rule-based)');
});

aiRouter.post('/gift-finder', async (req, res) => {
  const { occasion, budget, recipient } = req.body;
  const maxPrice = budget || 2000;
  const products = await productRepo.findAll({ maxPrice }, { page: 1, limit: 8, skip: 0, sort: { rating: -1 } });
  sendSuccess(res, products, `Gift recommendations for ${occasion || 'any occasion'}`);
});

aiRouter.get('/trending', async (_req, res) => {
  const products = await productRepo.findBestSellers(6);
  sendSuccess(res, products, 'Trending products');
});

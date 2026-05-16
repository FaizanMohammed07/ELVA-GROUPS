import { Router } from 'express';
import { ProductRepository } from '../products/repositories/product.repository';
import { sendSuccess } from '../../utils/apiResponse';

const productRepo = new ProductRepository();
export const searchRouter = Router();

searchRouter.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q || q.length < 2) { sendSuccess(res, [], 'No results'); return; }
  const results = await productRepo.searchText(q, 20);
  sendSuccess(res, results, `Results for "${q}"`);
});

searchRouter.get('/suggestions', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) { sendSuccess(res, [], 'Suggestions'); return; }
  const results = await productRepo.searchText(q, 5);
  const suggestions = results.map((p) => ({ title: p.title, slug: p.slug, thumbnail: p.thumbnail }));
  sendSuccess(res, suggestions, 'Suggestions');
});

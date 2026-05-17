import { Request, Response } from 'express';
import slugify from 'slugify';
import { ProductRepository } from './repositories/product.repository';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/pagination';
import { AppError } from '../../utils/appError';
import { RedisCache } from '../../config/redis';

const productRepo = new ProductRepository();
const cache = new RedisCache('products', 600);

export const ProductController = {
  async list(req: Request, res: Response): Promise<void> {
    const pagination = parsePagination(req);
    const filter: any = {};

    if (req.query.category) filter.categoryIds = [req.query.category as string];
    if (req.query.tags) filter.tags = (req.query.tags as string).split(',');
    if (req.query.minPrice) filter.minPrice = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.maxPrice = Number(req.query.maxPrice);
    if (req.query.isPersonalizable) filter.isPersonalizable = req.query.isPersonalizable === 'true';
    if (req.query.collections) filter.collections = [req.query.collections as string];

    const [products, total] = await Promise.all([
      productRepo.findAll(filter, pagination),
      productRepo.count(filter),
    ]);

    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
    sendSuccess(res, products, 'Products fetched', 200, meta);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const cacheKey = `slug:${req.params["slug"] as string}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'Product fetched');
      return;
    }

    const product = await productRepo.findBySlug(req.params["slug"] as string);
    if (!product) throw AppError.notFound('Product not found');

    await productRepo.incrementView(product.id);
    await cache.set(cacheKey, product);
    sendSuccess(res, product, 'Product fetched');
  },

  async getFeatured(_req: Request, res: Response): Promise<void> {
    const cached = await cache.get<any[]>('featured');
    if (cached) { sendSuccess(res, cached, 'Featured products'); return; }
    const products = await productRepo.findFeatured();
    await cache.set('featured', products, 300);
    sendSuccess(res, products, 'Featured products');
  },

  async getNewArrivals(_req: Request, res: Response): Promise<void> {
    const products = await productRepo.findNewArrivals();
    sendSuccess(res, products, 'New arrivals');
  },

  async getBestSellers(_req: Request, res: Response): Promise<void> {
    const products = await productRepo.findBestSellers();
    sendSuccess(res, products, 'Best sellers');
  },

  async search(req: Request, res: Response): Promise<void> {
    const q = String(req.query.q || '');
    if (!q || q.length < 2) throw AppError.badRequest('Search query too short');
    const products = await productRepo.searchText(q);
    sendSuccess(res, products, `Search results for "${q}"`);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const product = await productRepo.findById(req.params["id"] as string);
    if (!product) throw AppError.notFound('Product not found');
    sendSuccess(res, product, 'Product fetched');
  },

  async getRelated(req: Request, res: Response): Promise<void> {
    const product = await productRepo.findById(req.params["id"] as string);
    if (!product) throw AppError.notFound('Product not found');
    const related = await productRepo.findRelated(
      product.id,
      product.categoryIds.map((c) => c.toString()),
    );
    sendSuccess(res, related, 'Related products');
  },

  async create(req: Request, res: Response): Promise<void> {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const product = await productRepo.create({ ...req.body, slug });
    await cache.invalidatePattern('featured');
    sendCreated(res, product, 'Product created');
  },

  async update(req: Request, res: Response): Promise<void> {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }
    const product = await productRepo.update(req.params["id"] as string, req.body);
    await cache.invalidatePattern('');
    sendSuccess(res, product, 'Product updated');
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const product = await productRepo.update(req.params["id"] as string, { status: req.body.status });
    sendSuccess(res, product, 'Status updated');
  },

  async delete(req: Request, res: Response): Promise<void> {
    await productRepo.delete(req.params["id"] as string);
    sendSuccess(res, null, 'Product deleted');
  },

  async updateStock(req: Request, res: Response): Promise<void> {
    const { quantity, operation } = req.body;
    if (operation === 'increment') {
      await productRepo.incrementStock(req.params["id"] as string, quantity);
    } else {
      await productRepo.decrementStock(req.params["id"] as string, quantity);
    }
    sendSuccess(res, null, 'Stock updated');
  },
};

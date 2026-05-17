import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { validateBody, validateQuery } from '../../middleware/validate';
import { productCreateSchema, productUpdateSchema, productQuerySchema } from './product.validators';

export const productRouter = Router();

// Public routes
productRouter.get('/', validateQuery(productQuerySchema), ProductController.list);
productRouter.get('/featured', ProductController.getFeatured);
productRouter.get('/new-arrivals', ProductController.getNewArrivals);
productRouter.get('/best-sellers', ProductController.getBestSellers);
productRouter.get('/search', ProductController.search);
productRouter.get('/id/:id', ProductController.getById);
productRouter.get('/:slug', optionalAuthenticate, ProductController.getBySlug);
productRouter.get('/:id/related', ProductController.getRelated);

// Admin routes
productRouter.use(authenticate, requireAdmin);
productRouter.post('/', validateBody(productCreateSchema), ProductController.create);
productRouter.put('/:id', validateBody(productUpdateSchema), ProductController.update);
productRouter.patch('/:id/status', ProductController.updateStatus);
productRouter.delete('/:id', ProductController.delete);
productRouter.patch('/:id/stock', ProductController.updateStock);

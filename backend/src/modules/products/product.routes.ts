import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { validateBody, validateQuery } from '../../middleware/validate';
import { validateMongoId } from '../../middleware/mongoId';
import { productCreateSchema, productUpdateSchema, productQuerySchema } from './product.validators';

export const productRouter = Router();

// Public routes
productRouter.get('/', validateQuery(productQuerySchema), ProductController.list);
productRouter.get('/featured', ProductController.getFeatured);
productRouter.get('/new-arrivals', ProductController.getNewArrivals);
productRouter.get('/best-sellers', ProductController.getBestSellers);
productRouter.get('/search', ProductController.search);
productRouter.get('/id/:id', validateMongoId(), ProductController.getById);
productRouter.get('/:slug', optionalAuthenticate, ProductController.getBySlug);
productRouter.get('/:id/related', validateMongoId(), ProductController.getRelated);

// Admin routes
productRouter.use(authenticate, requireAdmin);
productRouter.post('/', validateBody(productCreateSchema), ProductController.create);
productRouter.put('/:id', validateMongoId(), validateBody(productUpdateSchema), ProductController.update);
productRouter.patch('/:id/status', validateMongoId(), ProductController.updateStatus);
productRouter.delete('/:id', validateMongoId(), ProductController.delete);
productRouter.patch('/:id/stock', validateMongoId(), ProductController.updateStock);

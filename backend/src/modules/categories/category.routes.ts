import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';

export const categoryRouter = Router();

// Public
categoryRouter.get('/', CategoryController.list);
categoryRouter.get('/featured', CategoryController.getFeatured);
categoryRouter.get('/tree', CategoryController.getTree);
categoryRouter.get('/:slug', CategoryController.getBySlug);
categoryRouter.get('/:id/products', CategoryController.getProducts);

// Admin
categoryRouter.use(authenticate, requireAdmin);
categoryRouter.post('/', CategoryController.create);
categoryRouter.put('/:id', CategoryController.update);
categoryRouter.patch('/:id/status', CategoryController.toggleStatus);
categoryRouter.delete('/:id', CategoryController.delete);
categoryRouter.post('/reorder', CategoryController.reorder);

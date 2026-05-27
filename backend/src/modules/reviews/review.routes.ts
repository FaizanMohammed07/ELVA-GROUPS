import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { validateMongoId } from '../../middleware/mongoId';
import { reviewCreateLimiter } from '../../middleware/rateLimiter';
import { createReviewSchema, updateReviewSchema, reviewResponseSchema } from './review.validators';

export const reviewRouter = Router();

reviewRouter.get('/product/:productId', validateMongoId('productId'), ReviewController.getProductReviews);
reviewRouter.get('/product/:productId/summary', validateMongoId('productId'), ReviewController.getReviewSummary);

reviewRouter.use(authenticate);
reviewRouter.post('/', reviewCreateLimiter, validateBody(createReviewSchema), ReviewController.createReview);
reviewRouter.put('/:id', validateMongoId(), validateBody(updateReviewSchema), ReviewController.updateReview);
reviewRouter.delete('/:id', validateMongoId(), ReviewController.deleteReview);
reviewRouter.post('/:id/helpful', validateMongoId(), ReviewController.markHelpful);

reviewRouter.use(requireAdmin);
reviewRouter.get('/', ReviewController.listAllReviews);
reviewRouter.patch('/:id/approve', validateMongoId(), ReviewController.approveReview);
reviewRouter.post('/:id/respond', validateMongoId(), validateBody(reviewResponseSchema), ReviewController.respondToReview);

import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';

export const reviewRouter = Router();

reviewRouter.get('/product/:productId', ReviewController.getProductReviews);
reviewRouter.get('/product/:productId/summary', ReviewController.getReviewSummary);

reviewRouter.use(authenticate);
reviewRouter.post('/', ReviewController.createReview);
reviewRouter.put('/:id', ReviewController.updateReview);
reviewRouter.delete('/:id', ReviewController.deleteReview);
reviewRouter.post('/:id/helpful', ReviewController.markHelpful);

reviewRouter.use(requireAdmin);
reviewRouter.get('/', ReviewController.listAllReviews);
reviewRouter.patch('/:id/approve', ReviewController.approveReview);
reviewRouter.post('/:id/respond', ReviewController.respondToReview);

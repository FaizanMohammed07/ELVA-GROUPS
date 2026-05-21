import { Request, Response } from 'express';
import { ReviewModel } from './models/review.model';
import { ProductRepository } from '../products/repositories/product.repository';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';

const productRepo = new ProductRepository();

export const ReviewController = {
  async getProductReviews(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const reviews = await ReviewModel.find({ productId: req.params["productId"] as string })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    sendSuccess(res, reviews, 'Reviews fetched');
  },

  async getReviewSummary(req: Request, res: Response): Promise<void> {
    const reviews = await ReviewModel.find({ productId: req.params["productId"] as string }, 'rating');
    const total = reviews.length;
    const avg = total ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
    sendSuccess(res, { average: Math.round(avg * 10) / 10, total, distribution }, 'Summary');
  },

  async createReview(req: Request, res: Response): Promise<void> {
    const existing = await ReviewModel.findOne({ productId: req.body.productId, userId: req.user!.id });
    if (existing) throw AppError.conflict('You have already reviewed this product');
    const review = await ReviewModel.create({ ...req.body, userId: req.user!.id, isApproved: true });
    sendCreated(res, review, 'Review submitted successfully!');
  },

  async updateReview(req: Request, res: Response): Promise<void> {
    const review = await ReviewModel.findOneAndUpdate(
      { _id: req.params["id"] as string, userId: req.user!.id },
      { $set: req.body },
      { new: true },
    );
    if (!review) throw AppError.notFound('Review not found');
    sendSuccess(res, review, 'Review updated');
  },

  async deleteReview(req: Request, res: Response): Promise<void> {
    await ReviewModel.findOneAndDelete({ _id: req.params["id"] as string, userId: req.user!.id });
    sendSuccess(res, null, 'Review deleted');
  },

  async markHelpful(req: Request, res: Response): Promise<void> {
    await ReviewModel.findByIdAndUpdate(req.params["id"] as string, { $inc: { helpfulVotes: 1 } });
    sendSuccess(res, null, 'Marked as helpful');
  },

  // Admin
  async listAllReviews(req: Request, res: Response): Promise<void> {
    const filter: any = {};
    if (req.query.isApproved !== undefined) filter.isApproved = req.query.isApproved === 'true';
    const reviews = await ReviewModel.find(filter)
      .populate('userId', 'name email')
      .populate('productId', 'title')
      .sort({ createdAt: -1 });
    sendSuccess(res, reviews, 'Reviews fetched');
  },

  async approveReview(req: Request, res: Response): Promise<void> {
    const review = await ReviewModel.findByIdAndUpdate(
      req.params["id"] as string,
      { $set: { isApproved: true } },
      { new: true },
    );
    if (!review) throw AppError.notFound('Review not found');

    // Update product rating
    const reviews = await ReviewModel.find({ productId: review.productId, isApproved: true }, 'rating');
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await productRepo.updateRating(review.productId.toString(), Math.round(avg * 10) / 10, reviews.length);

    sendSuccess(res, review, 'Review approved');
  },

  async respondToReview(req: Request, res: Response): Promise<void> {
    const review = await ReviewModel.findByIdAndUpdate(
      req.params["id"] as string,
      { $set: { response: { body: req.body.body, respondedAt: new Date() } } },
      { new: true },
    );
    if (!review) throw AppError.notFound('Review not found');
    sendSuccess(res, review, 'Response added');
  },
};

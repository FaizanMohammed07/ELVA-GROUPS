import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../../utils/apiResponse';

const WishlistModel = mongoose.model(
  'Wishlist',
  new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now },
  }, { timestamps: false }),
);

export const WishlistController = {
  async getWishlist(req: Request, res: Response): Promise<void> {
    const items = await WishlistModel.find({ userId: req.user!.id })
      .populate('productId', 'title slug thumbnail price compareAtPrice status')
      .sort({ addedAt: -1 });
    sendSuccess(res, items, 'Wishlist fetched');
  },

  async addToWishlist(req: Request, res: Response): Promise<void> {
    await WishlistModel.findOneAndUpdate(
      { userId: req.user!.id, productId: req.params.productId },
      { $set: { addedAt: new Date() } },
      { upsert: true, new: true },
    );
    sendSuccess(res, null, 'Added to wishlist');
  },

  async removeFromWishlist(req: Request, res: Response): Promise<void> {
    await WishlistModel.findOneAndDelete({ userId: req.user!.id, productId: req.params.productId });
    sendSuccess(res, null, 'Removed from wishlist');
  },

  async checkWishlist(req: Request, res: Response): Promise<void> {
    const item = await WishlistModel.findOne({ userId: req.user!.id, productId: req.params.productId });
    sendSuccess(res, { isWishlisted: !!item }, 'Wishlist status');
  },
};

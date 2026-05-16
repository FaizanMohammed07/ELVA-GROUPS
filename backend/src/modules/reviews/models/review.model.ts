import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  id: string;
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  helpfulVotes: number;
  response?: { body: string; respondedAt: Date };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 200 },
    body: { type: String, required: true, maxlength: 2000 },
    images: [String],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    response: {
      body: String,
      respondedAt: Date,
      _id: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

ReviewSchema.index({ productId: 1, isApproved: 1 });
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
ReviewSchema.virtual('id').get(function () { return this._id.toHexString(); });

export const ReviewModel: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);

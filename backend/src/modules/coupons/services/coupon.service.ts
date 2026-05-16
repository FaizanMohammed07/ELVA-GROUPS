import mongoose from 'mongoose';
import { AppError } from '../../../utils/appError';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 },
  userLimit: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  startsAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const CouponModel = mongoose.model('Coupon', CouponSchema);

export class CouponService {
  async applyCoupon(code: string, userId: string, orderValue: number): Promise<{ discount: number; couponId: string }> {
    const coupon = await CouponModel.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw AppError.badRequest('Invalid coupon code');

    const now = new Date();
    if (coupon.expiresAt && coupon.expiresAt < now) throw AppError.badRequest('Coupon has expired');
    if (coupon.startsAt && coupon.startsAt > now) throw AppError.badRequest('Coupon is not active yet');
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      throw AppError.badRequest(`Minimum order value of ₹${coupon.minOrderValue} required`);
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw AppError.badRequest('Coupon usage limit reached');
    }

    const userUsage = coupon.usedBy.filter((id) => id.toString() === userId).length;
    if (userUsage >= (coupon.userLimit || 1)) {
      throw AppError.badRequest('You have already used this coupon');
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (orderValue * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, orderValue);
    } else if (coupon.type === 'free_shipping') {
      discount = 79;
    }

    await CouponModel.findByIdAndUpdate(coupon.id, {
      $inc: { usageCount: 1 },
      $push: { usedBy: userId },
    });

    return { discount: Math.round(discount), couponId: coupon.id };
  }

  async validate(code: string, userId: string, orderValue: number): Promise<any> {
    const coupon = await CouponModel.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw AppError.badRequest('Invalid coupon code');
    return coupon;
  }

  async create(data: any) { return CouponModel.create(data); }
  async update(id: string, data: any) { return CouponModel.findByIdAndUpdate(id, { $set: data }, { new: true }); }
  async list() { return CouponModel.find().sort({ createdAt: -1 }); }
  async deactivate(id: string) { await CouponModel.findByIdAndUpdate(id, { $set: { isActive: false } }); }
}

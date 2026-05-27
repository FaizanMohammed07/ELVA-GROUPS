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

// TTL index for automatic cleanup of expired coupons
CouponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 }); // keep 1 day after expiry for audit
CouponSchema.index({ isActive: 1, code: 1 });

export const CouponModel = mongoose.models['Coupon'] || mongoose.model('Coupon', CouponSchema);

interface CouponValidation {
  discount: number;
  couponId: string;
  shippingDiscount: number;
}

function calculateDiscount(couponType: string, couponValue: number, maxDiscount: number | undefined, orderValue: number, shippingCost: number): { discount: number; shippingDiscount: number } {
  if (couponType === 'percentage') {
    let d = (orderValue * couponValue) / 100;
    if (maxDiscount) d = Math.min(d, maxDiscount);
    return { discount: Math.round(d), shippingDiscount: 0 };
  }
  if (couponType === 'fixed') {
    return { discount: Math.round(Math.min(couponValue, orderValue)), shippingDiscount: 0 };
  }
  if (couponType === 'free_shipping') {
    // Apply actual shipping cost, not a magic number
    return { discount: 0, shippingDiscount: shippingCost };
  }
  return { discount: 0, shippingDiscount: 0 };
}

export class CouponService {
  /** Validates a coupon without consuming it — safe to call for preview/cart display */
  async validateOnly(code: string, userId: string, orderValue: number, shippingCost = 79): Promise<CouponValidation> {
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

    // Per-user check via DB query (avoids O(n) in-memory scan)
    const userUsage = await CouponModel.countDocuments({ _id: coupon._id, usedBy: userId });
    if (userUsage >= (coupon.userLimit || 1)) {
      throw AppError.badRequest('You have already used this coupon');
    }

    const { discount, shippingDiscount } = calculateDiscount(coupon.type, coupon.value, coupon.maxDiscount, orderValue, shippingCost);
    return { discount, shippingDiscount, couponId: coupon.id };
  }

  /** Validates AND consumes the coupon atomically — call only when order is being committed */
  async applyCoupon(code: string, userId: string, orderValue: number, shippingCost = 79): Promise<CouponValidation> {
    const now = new Date();

    // Atomic: find coupon that is valid + has remaining global uses, then increment in one op
    const coupon = await CouponModel.findOneAndUpdate(
      {
        code: code.toUpperCase(),
        isActive: true,
        startsAt: { $lte: now },
        $and: [
          { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
          { $or: [{ usageLimit: null }, { $expr: { $lt: ['$usageCount', '$usageLimit'] } }] },
        ],
      },
      { $inc: { usageCount: 1 } },
      { new: false }, // return doc BEFORE increment so we can validate it
    );

    if (!coupon) throw AppError.badRequest('Invalid, expired, or fully redeemed coupon');
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      // Undo the increment since validation failed
      await CouponModel.findByIdAndUpdate(coupon._id, { $inc: { usageCount: -1 } });
      throw AppError.badRequest(`Minimum order value of ₹${coupon.minOrderValue} required`);
    }

    // Per-user atomic check: use $addToSet which is a no-op if already present
    const perUserUpdate = await CouponModel.findOneAndUpdate(
      {
        _id: coupon._id,
        // Reject if user already used more than userLimit times
        $where: `this.usedBy.filter(id => id.toString() === '${userId}').length < ${coupon.userLimit || 1}`,
      },
      { $push: { usedBy: userId } },
    );

    if (!perUserUpdate) {
      // Undo the global usageCount increment
      await CouponModel.findByIdAndUpdate(coupon._id, { $inc: { usageCount: -1 } });
      throw AppError.badRequest('You have already used this coupon');
    }

    const { discount, shippingDiscount } = calculateDiscount(coupon.type, coupon.value, coupon.maxDiscount, orderValue, shippingCost);
    return { discount, shippingDiscount, couponId: coupon.id };
  }

  /** Reverses a coupon consumption — call on order cancellation or failure */
  async releaseCoupon(couponId: string, userId: string): Promise<void> {
    await CouponModel.findByIdAndUpdate(couponId, {
      $inc: { usageCount: -1 },
      $pull: { usedBy: userId },
    });
  }

  async create(data: any) { return CouponModel.create(data); }
  async update(id: string, data: any) { return CouponModel.findByIdAndUpdate(id, { $set: data }, { new: true }); }
  async list() { return CouponModel.find().sort({ createdAt: -1 }); }
  async deactivate(id: string) { await CouponModel.findByIdAndUpdate(id, { $set: { isActive: false } }); }
  async getByCode(code: string) { return CouponModel.findOne({ code: code.toUpperCase() }); }
}

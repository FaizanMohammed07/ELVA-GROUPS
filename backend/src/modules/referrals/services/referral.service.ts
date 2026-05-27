import mongoose from 'mongoose';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';

const ReferralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  code: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['pending', 'completed', 'rewarded'], default: 'pending' },
  rewardPoints: { type: Number, default: 200 },
  completedAt: Date,
}, { timestamps: true });

export const ReferralModel = mongoose.model('Referral', ReferralSchema);

const loyaltyService = new LoyaltyService();

export class ReferralService {
  async generateCode(userId: string): Promise<string> {
    const existing = await ReferralModel.findOne({ referrerId: userId, referredId: { $exists: false } });
    if (existing) return existing.code;
    const code = `ELUNORA${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await ReferralModel.create({ referrerId: userId, code });
    return code;
  }

  async applyReferral(code: string, newUserId: string): Promise<void> {
    const referral = await ReferralModel.findOne({ code, status: 'pending' });
    if (!referral || referral.referrerId.toString() === newUserId) return;

    await ReferralModel.findByIdAndUpdate(referral.id, {
      $set: { referredId: newUserId, status: 'completed', completedAt: new Date() },
    });

    await loyaltyService.addPoints(referral.referrerId.toString(), referral.rewardPoints, 'REFERRAL_REWARD', code);
    await loyaltyService.addPoints(newUserId, 50, 'REFERRAL_SIGNUP_BONUS', code);
  }

  async getUserReferrals(userId: string) {
    return ReferralModel.find({ referrerId: userId }).populate('referredId', 'name email createdAt');
  }
}

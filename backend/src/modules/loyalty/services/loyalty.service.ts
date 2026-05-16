import mongoose from 'mongoose';
import { AppError } from '../../../utils/appError';

const LoyaltySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
  points: { type: Number, default: 0, min: 0 },
  lifetimePoints: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
}, { timestamps: true });

const LoyaltyTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  points: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  reason: { type: String, required: true },
  reference: String,
  balance: { type: Number, required: true },
}, { timestamps: true });

export const LoyaltyModel = mongoose.model('Loyalty', LoyaltySchema);
export const LoyaltyTransactionModel = mongoose.model('LoyaltyTransaction', LoyaltyTransactionSchema);

const TIER_THRESHOLDS = { bronze: 0, silver: 500, gold: 2000, platinum: 5000 };

export class LoyaltyService {
  async getOrCreate(userId: string) {
    return LoyaltyModel.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, points: 0, lifetimePoints: 0, tier: 'bronze' } },
      { upsert: true, new: true },
    );
  }

  async getBalance(userId: string): Promise<number> {
    const loyalty = await LoyaltyModel.findOne({ userId });
    return loyalty?.points ?? 0;
  }

  async addPoints(userId: string, points: number, reason: string, reference?: string): Promise<void> {
    const loyalty = await this.getOrCreate(userId);
    const newBalance = loyalty.points + points;
    const newLifetime = loyalty.lifetimePoints + points;
    const tier = this.calculateTier(newLifetime);

    await LoyaltyModel.findOneAndUpdate(
      { userId },
      { $set: { points: newBalance, lifetimePoints: newLifetime, tier } },
    );
    await LoyaltyTransactionModel.create({
      userId, points, type: 'credit', reason, reference, balance: newBalance,
    });
  }

  async deductPoints(userId: string, points: number, reason: string): Promise<void> {
    const loyalty = await LoyaltyModel.findOne({ userId });
    if (!loyalty || loyalty.points < points) throw AppError.badRequest('Insufficient loyalty points');
    const newBalance = loyalty.points - points;
    await LoyaltyModel.findOneAndUpdate({ userId }, { $set: { points: newBalance } });
    await LoyaltyTransactionModel.create({
      userId, points: -points, type: 'debit', reason, balance: newBalance,
    });
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return LoyaltyTransactionModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  private calculateTier(lifetimePoints: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum';
    if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold';
    if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver';
    return 'bronze';
  }
}

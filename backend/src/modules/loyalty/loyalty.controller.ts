import { Request, Response } from 'express';
import { LoyaltyService, LoyaltyModel } from './services/loyalty.service';
import { sendSuccess } from '../../utils/apiResponse';

const loyaltyService = new LoyaltyService();

export const LoyaltyController = {
  async getMyLoyalty(req: Request, res: Response): Promise<void> {
    const loyalty = await loyaltyService.getOrCreate(req.user!.id);
    sendSuccess(res, loyalty, 'Loyalty data fetched');
  },
  async getHistory(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const history = await loyaltyService.getTransactionHistory(req.user!.id, page);
    sendSuccess(res, history, 'Transaction history');
  },
  async getTiers(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, {
      tiers: [
        { name: 'bronze', minPoints: 0, benefits: ['1x points on purchases'] },
        { name: 'silver', minPoints: 500, benefits: ['1.5x points', 'Priority support'] },
        { name: 'gold', minPoints: 2000, benefits: ['2x points', 'Free shipping', 'Early access'] },
        { name: 'platinum', minPoints: 5000, benefits: ['3x points', 'Free express shipping', 'Exclusive gifts', 'Personal shopper'] },
      ],
    }, 'Tier info');
  },
};

import { Request, Response } from 'express';
import { ReferralService } from './services/referral.service';
import { sendSuccess } from '../../utils/apiResponse';

const referralService = new ReferralService();

export const ReferralController = {
  async getMyCode(req: Request, res: Response): Promise<void> {
    const code = await referralService.generateCode(req.user!.id);
    const referralUrl = `https://elva.in/signup?ref=${code}`;
    sendSuccess(res, { code, referralUrl }, 'Referral code');
  },
  async getMyReferrals(req: Request, res: Response): Promise<void> {
    const referrals = await referralService.getUserReferrals(req.user!.id);
    sendSuccess(res, referrals, 'Referrals fetched');
  },
};

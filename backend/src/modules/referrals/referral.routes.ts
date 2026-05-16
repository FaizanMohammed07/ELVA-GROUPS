import { Router } from 'express';
import { ReferralController } from './referral.controller';
import { authenticate } from '../../middleware/authenticate';

export const referralRouter = Router();

referralRouter.use(authenticate);
referralRouter.get('/my-code', ReferralController.getMyCode);
referralRouter.get('/my-referrals', ReferralController.getMyReferrals);

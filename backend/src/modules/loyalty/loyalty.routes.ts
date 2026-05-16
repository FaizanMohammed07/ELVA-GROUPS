import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller';
import { authenticate } from '../../middleware/authenticate';

export const loyaltyRouter = Router();

loyaltyRouter.use(authenticate);
loyaltyRouter.get('/', LoyaltyController.getMyLoyalty);
loyaltyRouter.get('/history', LoyaltyController.getHistory);
loyaltyRouter.get('/tiers', LoyaltyController.getTiers);

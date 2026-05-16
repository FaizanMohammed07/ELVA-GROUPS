import { Router } from 'express';
import { CouponController } from './coupon.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';

export const couponRouter = Router();

couponRouter.post('/validate', authenticate, CouponController.validate);

couponRouter.use(authenticate, requireAdmin);
couponRouter.get('/', CouponController.list);
couponRouter.post('/', CouponController.create);
couponRouter.put('/:id', CouponController.update);
couponRouter.delete('/:id', CouponController.deactivate);

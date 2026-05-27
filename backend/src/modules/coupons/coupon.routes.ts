import { Router } from 'express';
import { CouponController } from './coupon.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { validateMongoId } from '../../middleware/mongoId';
import { couponRateLimiter } from '../../middleware/rateLimiter';
import { couponValidateSchema, createCouponSchema, updateCouponSchema } from './coupon.validators';

export const couponRouter = Router();

couponRouter.post(
  '/validate',
  authenticate,
  couponRateLimiter,
  validateBody(couponValidateSchema),
  CouponController.validate,
);

couponRouter.use(authenticate, requireAdmin);
couponRouter.get('/', CouponController.list);
couponRouter.post('/', validateBody(createCouponSchema), CouponController.create);
couponRouter.put('/:id', validateMongoId(), validateBody(updateCouponSchema), CouponController.update);
couponRouter.delete('/:id', validateMongoId(), CouponController.deactivate);

import { Request, Response } from 'express';
import { CouponService } from './services/coupon.service';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';

const couponService = new CouponService();

export const CouponController = {
  async validate(req: Request, res: Response): Promise<void> {
    const { code, orderValue } = req.body;
    const result = await couponService.applyCoupon(code, req.user!.id, orderValue);
    sendSuccess(res, result, 'Coupon valid');
  },
  async list(_req: Request, res: Response): Promise<void> {
    const coupons = await couponService.list();
    sendSuccess(res, coupons, 'Coupons fetched');
  },
  async create(req: Request, res: Response): Promise<void> {
    const coupon = await couponService.create(req.body);
    sendCreated(res, coupon, 'Coupon created');
  },
  async update(req: Request, res: Response): Promise<void> {
    const coupon = await couponService.update(req.params.id, req.body);
    sendSuccess(res, coupon, 'Coupon updated');
  },
  async deactivate(req: Request, res: Response): Promise<void> {
    await couponService.deactivate(req.params.id);
    sendSuccess(res, null, 'Coupon deactivated');
  },
};

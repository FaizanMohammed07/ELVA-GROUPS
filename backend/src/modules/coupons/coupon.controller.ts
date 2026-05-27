import { Request, Response } from 'express';
import { CouponService } from './services/coupon.service';
import { sendSuccess, sendCreated } from '../../utils/apiResponse';

const couponService = new CouponService();

export const CouponController = {
  // Preview-only: validates without consuming the coupon
  async validate(req: Request, res: Response): Promise<void> {
    const { code, orderValue, shippingCost } = req.body;
    const result = await couponService.validateOnly(code, req.user!.id, orderValue, shippingCost);
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
    const coupon = await couponService.update(req.params["id"] as string, req.body);
    sendSuccess(res, coupon, 'Coupon updated');
  },
  async deactivate(req: Request, res: Response): Promise<void> {
    await couponService.deactivate(req.params["id"] as string);
    sendSuccess(res, null, 'Coupon deactivated');
  },
};

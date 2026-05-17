import { Request, Response } from 'express';
import { OrderService } from './services/order.service';
import { OrderModel } from './models/order.model';
import { sendSuccess, sendCreated, buildPaginationMeta } from '../../utils/apiResponse';
import { parsePagination } from '../../utils/pagination';
import { AppError } from '../../utils/appError';

const orderService = new OrderService();

export const OrderController = {
  async createOrder(req: Request, res: Response): Promise<void> {
    const order = await orderService.createOrder(req.user!.id, req.body);
    sendCreated(res, order, 'Order placed successfully');
  },

  async getMyOrders(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { orders, total } = await orderService.getUserOrders(req.user!.id, page, limit);
    const meta = buildPaginationMeta(total, page, limit);
    sendSuccess(res, orders, 'Orders fetched', 200, meta);
  },

  async getMyOrder(req: Request, res: Response): Promise<void> {
    const order = await orderService.getOrder(req.params["id"] as string, req.user!.id);
    sendSuccess(res, order, 'Order fetched');
  },

  async getMyOrderByNumber(req: Request, res: Response): Promise<void> {
    const order = await orderService.getOrderByNumber(req.params["orderNumber"] as string, req.user!.id);
    sendSuccess(res, order, 'Order fetched');
  },

  async cancelOrder(req: Request, res: Response): Promise<void> {
    const order = await orderService.cancelOrder(req.params["id"] as string, req.user!.id, req.body.reason);
    sendSuccess(res, order, 'Order cancelled');
  },

  async requestReturn(req: Request, res: Response): Promise<void> {
    const order = await orderService.updateStatus(req.params["id"] as string, 'return_requested', `Return requested: ${req.body.reason}`);
    await OrderModel.findByIdAndUpdate(req.params["id"] as string, { returnReason: req.body.reason });
    sendSuccess(res, order, 'Return request submitted');
  },

  // Admin
  async listOrders(req: Request, res: Response): Promise<void> {
    const pagination = parsePagination(req);
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .sort(pagination.sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .populate('userId', 'name email phone'),
      OrderModel.countDocuments(filter),
    ]);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
    sendSuccess(res, orders, 'Orders fetched', 200, meta);
  },

  async getOrder(req: Request, res: Response): Promise<void> {
    const order = await orderService.getOrder(req.params["id"] as string);
    sendSuccess(res, order, 'Order fetched');
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const { status, message } = req.body;
    const order = await orderService.updateStatus(req.params["id"] as string, status, message, req.user!.id);
    sendSuccess(res, order, 'Order status updated');
  },

  async updateTracking(req: Request, res: Response): Promise<void> {
    const order = await OrderModel.findByIdAndUpdate(
      req.params["id"] as string,
      { $set: { tracking: req.body } },
      { new: true },
    );
    if (!order) throw AppError.notFound('Order not found');
    sendSuccess(res, order, 'Tracking updated');
  },
};

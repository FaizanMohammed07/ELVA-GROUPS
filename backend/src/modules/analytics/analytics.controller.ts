import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/apiResponse';

const analyticsService = new AnalyticsService();

const parseDateRange = (req: Request): { from: Date; to: Date } => {
  const from = req.query.from ? new Date(String(req.query.from)) : dayjs().subtract(30, 'day').toDate();
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();
  return { from, to };
};

export const AnalyticsController = {
  async getDashboard(_req: Request, res: Response): Promise<void> {
    const summary = await analyticsService.getDashboardSummary();
    sendSuccess(res, summary, 'Dashboard summary');
  },

  async getRevenue(req: Request, res: Response): Promise<void> {
    const { from, to } = parseDateRange(req);
    const data = await analyticsService.getRevenueAnalytics(from, to);
    sendSuccess(res, data, 'Revenue analytics');
  },

  async getUserStats(req: Request, res: Response): Promise<void> {
    const { from, to } = parseDateRange(req);
    const data = await analyticsService.getUserAnalytics(from, to);
    sendSuccess(res, data, 'User analytics');
  },

  async getTopProducts(req: Request, res: Response): Promise<void> {
    const { from, to } = parseDateRange(req);
    const limit = Number(req.query.limit) || 10;
    const data = await analyticsService.getTopProducts(from, to, limit);
    sendSuccess(res, data, 'Top products');
  },

  async getOrderStatus(req: Request, res: Response): Promise<void> {
    const { from, to } = parseDateRange(req);
    const data = await analyticsService.getOrderStatusBreakdown(from, to);
    sendSuccess(res, data, 'Order status breakdown');
  },

  async getInventoryAlerts(_req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getInventoryAlerts();
    sendSuccess(res, data, 'Inventory alerts');
  },

  async getConversion(req: Request, res: Response): Promise<void> {
    const { from, to } = parseDateRange(req);
    const data = await analyticsService.getConversionMetrics(from, to);
    sendSuccess(res, data, 'Conversion metrics');
  },

  async getRevenueByCategory(req: Request, res: Response): Promise<void> {
    const { from, to } = parseDateRange(req);
    const data = await analyticsService.getRevenueByCategory(from, to);
    sendSuccess(res, data, 'Revenue by category');
  },

  async getPaymentBreakdown(req: Request, res: Response): Promise<void> {
    const { from, to } = parseDateRange(req);
    const data = await analyticsService.getPaymentMethodBreakdown(from, to);
    sendSuccess(res, data, 'Payment method breakdown');
  },

  async getCfoSummary(_req: Request, res: Response): Promise<void> {
    const now = new Date();
    const thisMonth = dayjs().startOf('month').toDate();
    const lastMonth = dayjs().subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month').toDate();
    const [thisMonthData, lastMonthData, top, conv] = await Promise.all([
      analyticsService.getRevenueAnalytics(thisMonth, now),
      analyticsService.getRevenueAnalytics(lastMonth, lastMonthEnd),
      analyticsService.getTopProducts(thisMonth, now, 5),
      analyticsService.getConversionMetrics(thisMonth, now),
    ]);
    sendSuccess(res, {
      currentMonth: thisMonthData,
      lastMonth: lastMonthData,
      topProducts: top,
      conversion: conv,
    }, 'CFO Summary');
  },
};

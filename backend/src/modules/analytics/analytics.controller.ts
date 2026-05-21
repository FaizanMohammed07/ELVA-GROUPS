import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../utils/apiResponse';
import { ProductCostingModel } from '../costing/models/product-costing.model';
import { MaterialModel } from '../materials/models/material.model';

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
    const [thisMonthData, lastMonthData, top, conv, costBreakdown, lowStockCount] = await Promise.all([
      analyticsService.getRevenueAnalytics(thisMonth, now),
      analyticsService.getRevenueAnalytics(lastMonth, lastMonthEnd),
      analyticsService.getTopProducts(thisMonth, now, 8),
      analyticsService.getConversionMetrics(thisMonth, now),
      ProductCostingModel.find({ isActive: true })
        .select('productTitle netMarginPercent grossMarginPercent trueProductionCost currentSellingPrice')
        .sort({ netMarginPercent: -1 }).limit(20),
      MaterialModel.countDocuments({ isActive: true, $expr: { $lte: ['$currentStock', '$reorderPoint'] } }),
    ]);

    // Aggregate profit metrics across all costed products
    const profitMetrics = costBreakdown.length
      ? {
          avgNetMargin: Math.round(costBreakdown.reduce((s, c) => s + c.netMarginPercent, 0) / costBreakdown.length * 10) / 10,
          avgGrossMargin: Math.round(costBreakdown.reduce((s, c) => s + c.grossMarginPercent, 0) / costBreakdown.length * 10) / 10,
          topMarginProducts: costBreakdown.slice(0, 5),
          bottomMarginProducts: [...costBreakdown].sort((a, b) => a.netMarginPercent - b.netMarginPercent).slice(0, 5),
          costedProductCount: costBreakdown.length,
        }
      : null;

    sendSuccess(res, {
      currentMonth: thisMonthData,
      lastMonth: lastMonthData,
      topProducts: top,
      conversion: conv,
      profitMetrics,
      lowStockMaterials: lowStockCount,
    }, 'CFO Summary');
  },

  async getStartupHealthScore(_req: Request, res: Response): Promise<void> {
    const now = new Date();
    const thisMonth = dayjs().startOf('month').toDate();
    const lastMonth = dayjs().subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month').toDate();

    const [thisMonthData, lastMonthData, costings, alerts] = await Promise.all([
      analyticsService.getRevenueAnalytics(thisMonth, now),
      analyticsService.getRevenueAnalytics(lastMonth, lastMonthEnd),
      ProductCostingModel.find({ isActive: true }).select('netMarginPercent'),
      analyticsService.getInventoryAlerts(),
    ]);

    const revenueGrowth = lastMonthData.totalRevenue > 0
      ? ((thisMonthData.totalRevenue - lastMonthData.totalRevenue) / lastMonthData.totalRevenue) * 100
      : 0;
    const avgMargin = costings.length
      ? costings.reduce((s, c) => s + c.netMarginPercent, 0) / costings.length
      : 0;

    // Score components (0-100 each)
    const revenueScore = Math.min(100, Math.max(0, 50 + revenueGrowth));
    const marginScore = Math.min(100, Math.max(0, avgMargin * 2));
    const inventoryScore = Math.max(0, 100 - (alerts.lowStock.length + alerts.outOfStock.length * 3) * 5);
    const orderScore = Math.min(100, (thisMonthData.totalOrders / 10) * 10);

    const healthScore = Math.round((revenueScore * 0.35 + marginScore * 0.35 + inventoryScore * 0.15 + orderScore * 0.15));

    sendSuccess(res, {
      healthScore,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      avgNetMargin: Math.round(avgMargin * 10) / 10,
      components: { revenueScore, marginScore, inventoryScore, orderScore },
    }, 'Startup health score');
  },
};

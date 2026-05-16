import { OrderModel } from '../orders/models/order.model';
import { UserModel } from '../users/models/user.model';
import { ProductModel } from '../products/models/product.model';
import { ReviewModel } from '../reviews/models/review.model';
import dayjs from 'dayjs';

export class AnalyticsService {
  async getRevenueAnalytics(from: Date, to: Date) {
    const orders = await OrderModel.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalRevenue = orders.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = orders.reduce((sum, d) => sum + d.orders, 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    return { daily: orders, totalRevenue, totalOrders, avgOrderValue };
  }

  async getRevenueByCategory(from: Date, to: Date) {
    return OrderModel.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: from, $lte: to } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $unwind: '$product.categoryIds' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryIds',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          revenue: { $sum: '$items.totalPrice' },
          units: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);
  }

  async getUserAnalytics(from: Date, to: Date) {
    const newUsers = await UserModel.countDocuments({
      createdAt: { $gte: from, $lte: to },
    });
    const totalUsers = await UserModel.countDocuments({ isActive: true });
    const verifiedUsers = await UserModel.countDocuments({ isEmailVerified: true });

    const signupsTrend = await UserModel.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return { newUsers, totalUsers, verifiedUsers, signupsTrend };
  }

  async getTopProducts(from: Date, to: Date, limit = 10) {
    return OrderModel.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: from, $lte: to } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          title: { $first: '$items.title' },
          revenue: { $sum: '$items.totalPrice' },
          unitsSold: { $sum: '$items.quantity' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);
  }

  async getOrderStatusBreakdown(from: Date, to: Date) {
    return OrderModel.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { count: -1 } },
    ]);
  }

  async getInventoryAlerts() {
    const lowStock = await ProductModel.find({
      status: 'active',
      trackInventory: true,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }).select('title sku stock lowStockThreshold');

    const outOfStock = await ProductModel.find({
      status: 'active',
      stock: 0,
      trackInventory: true,
    }).select('title sku');

    return { lowStock, outOfStock };
  }

  async getDashboardSummary() {
    const now = new Date();
    const today = dayjs().startOf('day').toDate();
    const thisMonth = dayjs().startOf('month').toDate();
    const lastMonth = dayjs().subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = dayjs().subtract(1, 'month').endOf('month').toDate();

    const [
      todayRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalOrders,
      pendingOrders,
      totalUsers,
      newUsersToday,
      totalProducts,
      lowStockCount,
    ] = await Promise.all([
      OrderModel.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      OrderModel.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      OrderModel.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } }),
      UserModel.countDocuments({ isActive: true, role: 'customer' }),
      UserModel.countDocuments({ createdAt: { $gte: today } }),
      ProductModel.countDocuments({ status: 'active' }),
      ProductModel.countDocuments({
        status: 'active',
        trackInventory: true,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      }),
    ]);

    const monthRev = monthRevenue[0]?.total ?? 0;
    const lastMonthRev = lastMonthRevenue[0]?.total ?? 0;
    const revenueGrowth = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

    return {
      todayRevenue: todayRevenue[0]?.total ?? 0,
      monthRevenue: monthRev,
      lastMonthRevenue: lastMonthRev,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      monthOrders: monthRevenue[0]?.count ?? 0,
      totalOrders,
      pendingOrders,
      totalUsers,
      newUsersToday,
      totalProducts,
      lowStockCount,
    };
  }

  async getConversionMetrics(from: Date, to: Date) {
    const sessions = await ProductModel.aggregate([
      { $match: { updatedAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } },
    ]);
    const orders = await OrderModel.countDocuments({ createdAt: { $gte: from, $lte: to } });
    const totalViews = sessions[0]?.totalViews ?? 0;
    return { totalViews, orders, conversionRate: totalViews ? (orders / totalViews) * 100 : 0 };
  }

  async getPaymentMethodBreakdown(from: Date, to: Date) {
    return OrderModel.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
    ]);
  }
}

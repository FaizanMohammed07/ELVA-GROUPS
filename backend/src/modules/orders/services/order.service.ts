import { v4 as uuidv4 } from 'uuid';
import { OrderModel, IOrder, OrderStatus } from '../models/order.model';
import { ProductRepository } from '../../products/repositories/product.repository';
import { CartService } from '../../cart/services/cart.service';
import { CouponService } from '../../coupons/services/coupon.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { AppError } from '../../../utils/appError';
import { logger } from '../../../utils/logger';

const productRepo = new ProductRepository();
const cartService = new CartService();
const couponService = new CouponService();
const loyaltyService = new LoyaltyService();
const notificationService = new NotificationService();

export class OrderService {
  async createOrder(userId: string, payload: any): Promise<IOrder> {
    const cart = await cartService.getCart(userId);
    if (!cart.items.length) throw AppError.badRequest('Cart is empty');

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await productRepo.findById(item.productId);
      if (!product) throw AppError.badRequest(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity && !product.allowBackorder) {
        throw AppError.conflict(`Insufficient stock for: ${product.title}`);
      }
      const unitPrice = item.variantId
        ? (product.variants.find((v) => v._id?.toString() === item.variantId)?.price ?? product.price)
        : product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;
      orderItems.push({
        productId: product.id,
        variantId: item.variantId,
        title: product.title,
        sku: product.sku,
        thumbnail: product.thumbnail || product.images[0],
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        personalization: item.personalization,
        isPersonalized: !!item.personalization && Object.keys(item.personalization).length > 0,
      });
    }

    let couponDiscount = 0;
    let couponCode: string | undefined;
    if (payload.couponCode) {
      const coupon = await couponService.applyCoupon(payload.couponCode, userId, subtotal);
      couponDiscount = coupon.discount;
      couponCode = payload.couponCode;
    }

    let loyaltyDiscount = 0;
    if (payload.usePoints) {
      const points = await loyaltyService.getBalance(userId);
      loyaltyDiscount = Math.min(points * 0.1, subtotal * 0.1);
    }

    const shippingCost = subtotal >= 999 ? 0 : 79;
    const discount = couponDiscount + loyaltyDiscount;
    const tax = Math.round((subtotal - discount) * 0.18);
    const total = Math.max(0, subtotal - discount + shippingCost + tax);

    const order = await OrderModel.create({
      orderNumber: this.generateOrderNumber(),
      userId,
      items: orderItems,
      paymentMethod: payload.paymentMethod,
      shippingAddress: payload.shippingAddress,
      subtotal,
      discount,
      couponCode,
      couponDiscount,
      shippingCost,
      tax,
      total,
      loyaltyPointsUsed: payload.usePoints ? Math.floor(loyaltyDiscount / 0.1) : 0,
      timeline: [{ status: 'pending', message: 'Order placed', timestamp: new Date() }],
    });

    // Deduct stock
    for (const item of orderItems) {
      await productRepo.decrementStock(item.productId.toString(), item.quantity);
    }

    // Clear cart
    await cartService.clearCart(userId);

    // Loyalty points earned (1 point per ₹10)
    const pointsEarned = Math.floor(total / 10);
    await OrderModel.findByIdAndUpdate(order.id, { loyaltyPointsEarned: pointsEarned });

    await notificationService.sendOrderConfirmation(userId, order.orderNumber, total);

    logger.info('Order created', { orderId: order.id, userId, total });
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus, message: string, updatedBy?: string): Promise<IOrder> {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: { status },
        $push: { timeline: { status, message, timestamp: new Date(), updatedBy } },
      },
      { new: true },
    );
    if (!order) throw AppError.notFound('Order not found');

    if (status === 'delivered') {
      const pointsEarned = order.loyaltyPointsEarned;
      if (pointsEarned > 0) {
        await loyaltyService.addPoints(order.userId.toString(), pointsEarned, 'ORDER_DELIVERED');
      }
      await notificationService.sendDeliveryConfirmation(order.userId.toString(), order.orderNumber);
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason: string): Promise<IOrder> {
    const order = await OrderModel.findOne({ _id: orderId, userId });
    if (!order) throw AppError.notFound('Order not found');
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw AppError.badRequest('Order cannot be cancelled at this stage');
    }

    const updated = await this.updateStatus(orderId, 'cancelled', `Cancelled: ${reason}`);
    await OrderModel.findByIdAndUpdate(orderId, { cancelReason: reason });

    // Restore stock
    for (const item of order.items) {
      await productRepo.incrementStock(item.productId.toString(), item.quantity);
    }

    // Refund loyalty points used
    if (order.loyaltyPointsUsed > 0) {
      await loyaltyService.addPoints(userId, order.loyaltyPointsUsed, 'ORDER_CANCELLED_REFUND');
    }

    return updated;
  }

  async getOrder(orderId: string, userId?: string): Promise<IOrder> {
    const filter: any = { _id: orderId };
    if (userId) filter.userId = userId;
    const order = await OrderModel.findOne(filter).populate('items.productId', 'title slug thumbnail');
    if (!order) throw AppError.notFound('Order not found');
    return order;
  }

  async getUserOrders(userId: string, page = 1, limit = 10): Promise<{ orders: IOrder[]; total: number }> {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      OrderModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OrderModel.countDocuments({ userId }),
    ]);
    return { orders, total };
  }

  private generateOrderNumber(): string {
    const prefix = 'ELVA';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}

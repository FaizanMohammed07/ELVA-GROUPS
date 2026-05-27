import { v4 as uuidv4 } from 'uuid';
import { OrderModel, IOrder, OrderStatus } from '../models/order.model';
import { ProductRepository } from '../../products/repositories/product.repository';
import { CouponService } from '../../coupons/services/coupon.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { PaymentService } from '../../payments/services/payment.service';
import { AppError } from '../../../utils/appError';
import { logger } from '../../../utils/logger';

const productRepo = new ProductRepository();
const couponService = new CouponService();
const loyaltyService = new LoyaltyService();
const notificationService = new NotificationService();
const paymentService = new PaymentService();

export class OrderService {
  async createOrder(userId: string, payload: any): Promise<IOrder> {
    const requestItems: Array<{ productId: string; quantity: number; variantId?: string; personalization?: Record<string, string> }> = payload.items;
    if (!requestItems?.length) throw AppError.badRequest('No items in order');

    let subtotal = 0;
    const orderItems = [];

    for (const item of requestItems) {
      const product = await productRepo.findById(item.productId);
      if (!product) throw AppError.badRequest(`Product not found: ${item.productId}`);
      if (product.status !== 'active' && !product.allowBackorder) {
        throw AppError.badRequest(`Product is not available: ${product.title}`);
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
        slug: product.slug,
        sku: product.sku,
        thumbnail: product.thumbnail || product.images[0],
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        personalization: item.personalization,
        isPersonalized: !!item.personalization && Object.keys(item.personalization).length > 0,
      });
    }

    const shippingCost = subtotal >= 999 ? 0 : 79;

    let couponDiscount = 0;
    let shippingDiscount = 0;
    let couponCode: string | undefined;
    let couponId: string | undefined;
    if (payload.couponCode) {
      const coupon = await couponService.applyCoupon(payload.couponCode, userId, subtotal, shippingCost);
      couponDiscount = coupon.discount;
      shippingDiscount = coupon.shippingDiscount;
      couponCode = payload.couponCode;
      couponId = coupon.couponId;
    }

    let loyaltyDiscount = 0;
    if (payload.usePoints) {
      const points = await loyaltyService.getBalance(userId);
      loyaltyDiscount = Math.min(points * 0.1, subtotal * 0.1);
    }

    const discount = couponDiscount + loyaltyDiscount;
    const effectiveShipping = Math.max(0, shippingCost - shippingDiscount);
    const tax = Math.round((subtotal - discount) * 0.18);
    const total = Math.max(0, subtotal - discount + effectiveShipping + tax);
    const pointsEarned = Math.floor(total / 10);

    // Create order with all data in one atomic write (no separate update needed)
    let order: IOrder;
    try {
      order = await OrderModel.create({
        orderNumber: this.generateOrderNumber(),
        userId,
        items: orderItems,
        paymentMethod: payload.paymentMethod,
        shippingAddress: payload.shippingAddress,
        subtotal,
        discount,
        couponCode,
        couponDiscount,
        shippingCost: effectiveShipping,
        tax,
        total,
        loyaltyPointsUsed: payload.usePoints ? Math.floor(loyaltyDiscount / 0.1) : 0,
        loyaltyPointsEarned: pointsEarned,
        timeline: [{ status: 'pending', message: 'Order placed', timestamp: new Date() }],
      });
    } catch (err) {
      // Roll back coupon if order creation failed
      if (couponId && couponCode) {
        await couponService.releaseCoupon(couponId, userId).catch(() => {});
      }
      throw err;
    }

    // Deduct stock — rely on atomic decrementStock (has $gte guard, will throw if stock insufficient)
    for (const item of orderItems) {
      try {
        await productRepo.decrementStock(item.productId.toString(), item.quantity);
      } catch (stockErr) {
        // Roll back: delete the order and release coupon on stock failure
        await OrderModel.findByIdAndDelete(order.id).catch(() => {});
        if (couponId && couponCode) {
          await couponService.releaseCoupon(couponId, userId).catch(() => {});
        }
        throw stockErr;
      }
    }

    await notificationService.sendOrderConfirmation(userId, order.orderNumber, total);

    logger.info({ orderId: order.id, userId, total }, 'Order created');
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

    // If already paid, initiate refund before cancelling
    if (order.paymentStatus === 'paid') {
      await paymentService.initiateRefund(orderId);
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

  async getOrderByNumber(orderNumber: string, userId: string): Promise<IOrder> {
    const order = await OrderModel.findOne({ orderNumber, userId }).populate('items.productId', 'title slug thumbnail');
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
    // UUID-based to guarantee uniqueness under concurrent load
    const uid = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    return `ELUNORA-${timestamp}-${uid}`;
  }
}

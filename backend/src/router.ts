import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/users/user.routes';
import { productRouter } from './modules/products/product.routes';
import { categoryRouter } from './modules/categories/category.routes';
import { inventoryRouter } from './modules/inventory/inventory.routes';
import { cartRouter } from './modules/cart/cart.routes';
import { orderRouter } from './modules/orders/order.routes';
import { paymentRouter } from './modules/payments/payment.routes';
import { reviewRouter } from './modules/reviews/review.routes';
import { wishlistRouter } from './modules/wishlist/wishlist.routes';
import { couponRouter } from './modules/coupons/coupon.routes';
import { notificationRouter } from './modules/notifications/notification.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { subscriptionRouter } from './modules/subscriptions/subscription.routes';
import { loyaltyRouter } from './modules/loyalty/loyalty.routes';
import { referralRouter } from './modules/referrals/referral.routes';
import { shippingRouter } from './modules/shipping/shipping.routes';
import { contentRouter } from './modules/content/content.routes';
import { searchRouter } from './modules/search/search.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { uploadRouter } from './modules/upload/upload.routes';
import { aiRouter } from './modules/ai/ai.routes';

export const router = Router();

// Auth
router.use('/auth', authRouter);

// Users
router.use('/users', userRouter);

// Products & Categories
router.use('/products', productRouter);
router.use('/categories', categoryRouter);
router.use('/inventory', inventoryRouter);

// Commerce
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/payments', paymentRouter);
router.use('/coupons', couponRouter);
router.use('/shipping', shippingRouter);

// Engagement
router.use('/reviews', reviewRouter);
router.use('/wishlist', wishlistRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/loyalty', loyaltyRouter);
router.use('/referrals', referralRouter);

// Platform
router.use('/notifications', notificationRouter);
router.use('/analytics', analyticsRouter);
router.use('/content', contentRouter);
router.use('/search', searchRouter);
router.use('/upload', uploadRouter);
router.use('/ai', aiRouter);

// Admin
router.use('/admin', adminRouter);

// Health
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

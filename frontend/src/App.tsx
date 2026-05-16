import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { useAuthStore } from '@store/authStore';
import { PublicLayout } from '@components/layouts/PublicLayout';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { ProtectedRoute } from '@components/common/ProtectedRoute';
import { PageLoader } from '@components/common/PageLoader';

// Lazy load pages for optimal performance
const HomePage = lazy(() => import('@pages/public/HomePage'));
const ProductsPage = lazy(() => import('@pages/public/ProductsPage'));
const ProductDetailPage = lazy(() => import('@pages/public/ProductDetailPage'));
const CategoryPage = lazy(() => import('@pages/public/CategoryPage'));
const CartPage = lazy(() => import('@pages/public/CartPage'));
const CheckoutPage = lazy(() => import('@pages/public/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@pages/public/OrderConfirmationPage'));
const WishlistPage = lazy(() => import('@pages/public/WishlistPage'));
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@pages/auth/ResetPasswordPage'));
const AccountPage = lazy(() => import('@pages/account/AccountPage'));
const OrdersPage = lazy(() => import('@pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('@pages/account/OrderDetailPage'));
const LoyaltyPage = lazy(() => import('@pages/account/LoyaltyPage'));
const AboutPage = lazy(() => import('@pages/public/AboutPage'));
const ContactPage = lazy(() => import('@pages/public/ContactPage'));
const SearchPage = lazy(() => import('@pages/public/SearchPage'));
const GiftFinderPage = lazy(() => import('@pages/public/GiftFinderPage'));
const NotFoundPage = lazy(() => import('@pages/public/NotFoundPage'));

// Admin pages
const AdminDashboard = lazy(() => import('@pages/admin/DashboardPage'));
const AdminProducts = lazy(() => import('@pages/admin/ProductsPage'));
const AdminOrders = lazy(() => import('@pages/admin/OrdersPage'));
const AdminCustomers = lazy(() => import('@pages/admin/CustomersPage'));
const AdminInventory = lazy(() => import('@pages/admin/InventoryPage'));
const AdminMarketing = lazy(() => import('@pages/admin/MarketingPage'));
const AdminReviews = lazy(() => import('@pages/admin/ReviewsPage'));
const AdminContent = lazy(() => import('@pages/admin/ContentPage'));
const AdminSupport = lazy(() => import('@pages/admin/SupportPage'));
const AdminAnalytics = lazy(() => import('@pages/admin/AnalyticsPage'));

// Super admin pages
const SuperAdminDashboard = lazy(() => import('@pages/superadmin/DashboardPage'));
const SuperAdminStaff = lazy(() => import('@pages/superadmin/StaffPage'));
const SuperAdminFinancials = lazy(() => import('@pages/superadmin/FinancialsPage'));

export default function App() {
  const { initializeAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); };
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/gift-finder" element={<GiftFinderPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-confirmation/:orderNumber" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

          {/* Account */}
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/account/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin', 'super_admin', 'support', 'marketing', 'inventory']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="marketing" element={<AdminMarketing />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Super Admin routes */}
        <Route path="/super-admin" element={<ProtectedRoute roles={['super_admin']}><AdminLayout isSuperAdmin /></ProtectedRoute>}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="staff" element={<SuperAdminStaff />} />
          <Route path="financials" element={<SuperAdminFinancials />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

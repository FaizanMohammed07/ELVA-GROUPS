import { useEffect, lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { useAuthStore } from '@store/authStore';
import { PublicLayout } from '@components/layouts/PublicLayout';
import { AdminLayout } from '@components/layouts/AdminLayout';
import { ProtectedRoute } from '@components/common/ProtectedRoute';
import { AdminProtectedRoute } from '@components/common/AdminProtectedRoute';
import { PageLoader } from '@components/common/PageLoader';
import { SplashScreen } from '@components/common/SplashScreen';
import { CartAnimationProvider } from '@components/common/CartAnimationProvider';
import { ADMIN_LOGIN_SLUG, SUPER_ADMIN_LOGIN_SLUG } from '@config/admin';

// Lazy load pages
const HomePage = lazy(() => import('@pages/public/HomePage'));
const ProductsPage = lazy(() => import('@pages/public/ProductsPage'));
const ProductDetailPage = lazy(() => import('@pages/public/ProductDetailPage'));
const CategoryPage = lazy(() => import('@pages/public/CategoryPage'));
const CartPage = lazy(() => import('@pages/public/CartPage'));
const CheckoutPage = lazy(() => import('@pages/public/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@pages/public/OrderConfirmationPage'));
const WishlistPage = lazy(() => import('@pages/public/WishlistPage'));
const CustomOrderPage = lazy(() => import('@pages/public/CustomOrderPage'));
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@pages/auth/VerifyEmailPage'));
const AccountPage = lazy(() => import('@pages/account/AccountPage'));
const OrdersPage = lazy(() => import('@pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('@pages/account/OrderDetailPage'));
const LoyaltyPage = lazy(() => import('@pages/account/LoyaltyPage'));
const CustomOrdersPage = lazy(() => import('@pages/account/CustomOrdersPage'));
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
const SuperAdminSettings = lazy(() => import('@pages/superadmin/StoreSettingsPage'));
const SuperAdminAuditLogs = lazy(() => import('@pages/superadmin/AuditLogsPage'));
const CostingEnginePage = lazy(() => import('@pages/superadmin/CostingEnginePage'));
const ProfitIntelligencePage = lazy(() => import('@pages/superadmin/ProfitIntelligencePage'));
const SuperAdminMaterials = lazy(() => import('@pages/superadmin/MaterialsPage'));
const SuperAdminSuppliers = lazy(() => import('@pages/superadmin/SuppliersPage'));
const SuperAdminPackaging = lazy(() => import('@pages/superadmin/PackagingPage'));
const MaterialTemplatesPage = lazy(() => import('@pages/superadmin/MaterialTemplatesPage'));
const AdminCategories = lazy(() => import('@pages/admin/CategoriesPage'));

// Admin auth
const AdminLoginPage = lazy(() => import('@pages/auth/AdminLoginPage'));
const SuperAdminLoginPage = lazy(() => import('@pages/auth/SuperAdminLoginPage'));

const SPLASH_SEEN_KEY = 'elva-splash-seen';

export default function App() {
  const { initializeAuth } = useAuthStore();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith(`/${ADMIN_LOGIN_SLUG}`) || location.pathname.startsWith(`/${SUPER_ADMIN_LOGIN_SLUG}`);
  const [splashDone, setSplashDone] = useState(() => !!sessionStorage.getItem(SPLASH_SEEN_KEY) || isAdminRoute);

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    setSplashDone(true);
  };

  useEffect(() => {
    // Lenis must NOT run on admin/dashboard routes — those use an inner overflow-y-auto
    // scroll container (not window scroll), and Lenis intercepts wheel events on window,
    // swallowing them before they reach the inner container.
    if (isAdminRoute) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); };
  }, [isAdminRoute]);

  useEffect(() => { initializeAuth(); }, [initializeAuth]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <CartAnimationProvider>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
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
            <Route path="/custom-order" element={<CustomOrderPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderNumber" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

            {/* Account */}
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/account/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
            <Route path="/account/custom-orders" element={<ProtectedRoute><CustomOrdersPage /></ProtectedRoute>} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Admin login */}
          <Route path={`/${ADMIN_LOGIN_SLUG}/login`} element={<AdminLoginPage />} />

          {/* Admin routes */}
          <Route
            path={`/${ADMIN_LOGIN_SLUG}`}
            element={
              <AdminProtectedRoute roles={['admin', 'super_admin', 'support', 'marketing', 'inventory']}>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>

          {/* Super Admin login */}
          <Route path={`/${SUPER_ADMIN_LOGIN_SLUG}/login`} element={<SuperAdminLoginPage />} />

          {/* Super Admin routes */}
          <Route
            path={`/${SUPER_ADMIN_LOGIN_SLUG}`}
            element={
              <AdminProtectedRoute roles={['super_admin']}>
                <AdminLayout isSuperAdmin />
              </AdminProtectedRoute>
            }
          >
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="staff" element={<SuperAdminStaff />} />
            <Route path="financials" element={<SuperAdminFinancials />} />
            <Route path="settings" element={<SuperAdminSettings />} />
            <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
            <Route path="costing-engine" element={<CostingEnginePage />} />
            <Route path="profit-intelligence" element={<ProfitIntelligencePage />} />
            <Route path="materials" element={<SuperAdminMaterials />} />
            <Route path="suppliers" element={<SuperAdminSuppliers />} />
            <Route path="packaging" element={<SuperAdminPackaging />} />
            <Route path="material-templates" element={<MaterialTemplatesPage />} />
          </Route>

          {/* Convenience redirect — /admin goes to the actual admin login */}
          <Route path="/admin" element={<Navigate to={`/${ADMIN_LOGIN_SLUG}/login`} replace />} />
          <Route path="/admin/*" element={<Navigate to={`/${ADMIN_LOGIN_SLUG}/login`} replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </CartAnimationProvider>
  );
}

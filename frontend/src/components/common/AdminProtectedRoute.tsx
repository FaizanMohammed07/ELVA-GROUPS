import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { ADMIN_LOGIN_SLUG, ADMIN_BASE, SUPER_ADMIN_LOGIN_SLUG } from '@config/admin';
import { PageLoader } from './PageLoader';

const ADMIN_ROLES = ['admin', 'super_admin', 'support', 'marketing', 'inventory'];

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export const AdminProtectedRoute = ({ children, roles }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Determine which login page to redirect to based on current path
  const isSuperAdminRoute = location.pathname.startsWith(`/${SUPER_ADMIN_LOGIN_SLUG}`);
  const loginPath = isSuperAdminRoute
    ? `/${SUPER_ADMIN_LOGIN_SLUG}/login`
    : `/${ADMIN_LOGIN_SLUG}/login`;

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated || !user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (!ADMIN_ROLES.includes(user.role)) {
    return <Navigate to={loginPath} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`${ADMIN_BASE}/dashboard`} replace />;
  }

  return <>{children}</>;
};

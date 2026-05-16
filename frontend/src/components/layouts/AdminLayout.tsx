import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@components/admin/AdminSidebar';
import { AdminTopbar } from '@components/admin/AdminTopbar';
import { useAuthStore } from '@store/authStore';

interface AdminLayoutProps {
  isSuperAdmin?: boolean;
}

export const AdminLayout = ({ isSuperAdmin = false }: AdminLayoutProps) => {
  const { user } = useAuthStore();
  const isSA = isSuperAdmin || user?.role === 'super_admin';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar isSuperAdmin={isSA} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

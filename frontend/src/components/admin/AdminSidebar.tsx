import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  FileText, HeadphonesIcon, Boxes,
  Megaphone, Star, LogOut, Shield, DollarSign,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { cn } from '@utils/cn';
import { ADMIN_BASE, SUPER_BASE } from '@config/admin';

const ADMIN_NAV = [
  { label: 'Dashboard', href: `${ADMIN_BASE}/dashboard`, icon: LayoutDashboard },
  { label: 'Orders', href: `${ADMIN_BASE}/orders`, icon: ShoppingCart },
  { label: 'Products', href: `${ADMIN_BASE}/products`, icon: Package },
  { label: 'Customers', href: `${ADMIN_BASE}/customers`, icon: Users },
  { label: 'Inventory', href: `${ADMIN_BASE}/inventory`, icon: Boxes },
  { label: 'Marketing', href: `${ADMIN_BASE}/marketing`, icon: Megaphone },
  { label: 'Reviews', href: `${ADMIN_BASE}/reviews`, icon: Star },
  { label: 'Analytics', href: `${ADMIN_BASE}/analytics`, icon: BarChart2 },
  { label: 'Content', href: `${ADMIN_BASE}/content`, icon: FileText },
  { label: 'Support', href: `${ADMIN_BASE}/support`, icon: HeadphonesIcon },
];

const SUPER_ADMIN_NAV = [
  { label: 'Super Dashboard', href: `${SUPER_BASE}/dashboard`, icon: Shield },
  { label: 'Staff Management', href: `${SUPER_BASE}/staff`, icon: UserCheck },
  { label: 'CFO Dashboard', href: `${SUPER_BASE}/financials`, icon: DollarSign },
];

interface AdminSidebarProps { isSuperAdmin?: boolean; }

export const AdminSidebar = ({ isSuperAdmin = false }: AdminSidebarProps) => {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-charcoal-950 text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-charcoal-800">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-[0.3em]">ELVA</span>
          <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">
            {isSuperAdmin ? 'Super' : 'Admin'}
          </span>
        </Link>
        <p className="text-charcoal-400 text-xs mt-2 font-sans">{user?.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
        <div className="px-3 mb-2">
          <p className="text-[10px] text-charcoal-500 uppercase tracking-widest px-3 mb-2 font-sans">Management</p>
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans transition-all duration-150 mb-0.5',
                isActive
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'text-charcoal-400 hover:text-white hover:bg-charcoal-800',
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>

        {isSuperAdmin && (
          <div className="px-3 mt-4">
            <p className="text-[10px] text-charcoal-500 uppercase tracking-widest px-3 mb-2 font-sans">Super Admin</p>
            {SUPER_ADMIN_NAV.map(({ label, href, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                end
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-sans transition-all mb-0.5',
                  isActive
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'text-charcoal-400 hover:text-white hover:bg-charcoal-800',
                )}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-charcoal-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-charcoal-400 hover:text-white hover:bg-charcoal-800 rounded text-sm font-sans w-full transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

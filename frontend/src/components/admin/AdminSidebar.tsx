import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  FileText, HeadphonesIcon, Boxes, Megaphone, Star, LogOut,
  Shield, DollarSign, UserCheck, Settings, ClipboardList,
  Calculator, TrendingUp, FlaskConical, Truck, Gift,
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

const SUPER_NAV_GROUPS = [
  {
    group: 'Command Center',
    items: [
      { label: 'Founder Dashboard', href: `${SUPER_BASE}/dashboard`, icon: Shield },
      { label: 'CFO Dashboard', href: `${SUPER_BASE}/financials`, icon: DollarSign },
    ],
  },
  {
    group: 'Store Management',
    items: [
      { label: 'Products', href: `${ADMIN_BASE}/products`, icon: Package },
      { label: 'Orders', href: `${ADMIN_BASE}/orders`, icon: ShoppingCart },
      { label: 'Customers', href: `${ADMIN_BASE}/customers`, icon: Users },
      { label: 'Inventory', href: `${ADMIN_BASE}/inventory`, icon: Boxes },
      { label: 'Reviews', href: `${ADMIN_BASE}/reviews`, icon: Star },
      { label: 'Marketing', href: `${ADMIN_BASE}/marketing`, icon: Megaphone },
      { label: 'Support', href: `${ADMIN_BASE}/support`, icon: HeadphonesIcon },
      { label: 'Content', href: `${ADMIN_BASE}/content`, icon: FileText },
      { label: 'Analytics', href: `${ADMIN_BASE}/analytics`, icon: BarChart2 },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { label: 'Costing Engine', href: `${SUPER_BASE}/costing-engine`, icon: Calculator },
      { label: 'Profit Intelligence', href: `${SUPER_BASE}/profit-intelligence`, icon: TrendingUp },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Raw Materials', href: `${SUPER_BASE}/materials`, icon: FlaskConical },
      { label: 'Suppliers', href: `${SUPER_BASE}/suppliers`, icon: Truck },
      { label: 'Packaging', href: `${SUPER_BASE}/packaging`, icon: Gift },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Staff Management', href: `${SUPER_BASE}/staff`, icon: UserCheck },
      { label: 'Store Settings', href: `${SUPER_BASE}/settings`, icon: Settings },
      { label: 'Audit Logs', href: `${SUPER_BASE}/audit-logs`, icon: ClipboardList },
    ],
  },
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
        <p className="text-charcoal-400 text-xs mt-2 font-sans truncate">{user?.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
        {!isSuperAdmin ? (
          <div className="px-3">
            <p className="text-[10px] text-charcoal-500 uppercase tracking-widest px-3 mb-2 font-sans">Management</p>
            {ADMIN_NAV.map(({ label, href, icon: Icon }) => (
              <NavItem key={href} label={label} href={href} icon={Icon} />
            ))}
          </div>
        ) : (
          SUPER_NAV_GROUPS.map(({ group, items }) => (
            <div key={group} className="px-3 mb-4">
              <p className="text-[10px] text-charcoal-500 uppercase tracking-widest px-3 mb-1.5 font-sans">{group}</p>
              {items.map(({ label, href, icon: Icon }) => (
                <NavItem key={href} label={label} href={href} icon={Icon} />
              ))}
            </div>
          ))
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

const NavItem = ({ label, href, icon: Icon }: { label: string; href: string; icon: any }) => (
  <NavLink
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
);

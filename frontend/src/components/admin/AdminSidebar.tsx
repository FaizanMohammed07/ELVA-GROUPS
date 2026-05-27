import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart2,
  FileText, HeadphonesIcon, Boxes, Megaphone, Star, LogOut,
  Shield, DollarSign, UserCheck, Settings, ClipboardList,
  Calculator, TrendingUp, FlaskConical, Truck, Gift,
  ChevronRight, Tag, Layers, Archive, AlertTriangle,
  Banknote, Activity, Cpu, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { cn } from '@utils/cn';
import { ADMIN_BASE, SUPER_BASE } from '@config/admin';

// ── Types ────────────────────────────────────────────────────────────────────

interface NavItem { label: string; href: string; icon: any; }
interface NavGroup {
  id: string;
  label: string;
  icon: any;
  items: NavItem[];
}

// ── Admin nav (flat) ─────────────────────────────────────────────────────────

const ADMIN_NAV: NavItem[] = [
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

// ── Super admin groups ───────────────────────────────────────────────────────

const SUPER_GROUPS: NavGroup[] = [
  {
    id: 'product-intelligence',
    label: 'Product Intelligence',
    icon: Cpu,
    items: [
      { label: 'Categories', href: `${ADMIN_BASE}/categories`, icon: Tag },
      { label: 'Products', href: `${ADMIN_BASE}/products`, icon: Package },
      { label: 'Raw Materials', href: `${SUPER_BASE}/materials`, icon: FlaskConical },
      { label: 'Material Templates', href: `${SUPER_BASE}/material-templates`, icon: Layers },
      { label: 'AI Product Analysis', href: `${SUPER_BASE}/product-intelligence`, icon: Sparkles },
      { label: 'Product Costing', href: `${SUPER_BASE}/costing-engine`, icon: Calculator },
      { label: 'Packaging Engine', href: `${SUPER_BASE}/packaging`, icon: Gift },
      { label: 'Profit Intelligence', href: `${SUPER_BASE}/profit-intelligence`, icon: TrendingUp },
      { label: 'Supplier Management', href: `${SUPER_BASE}/suppliers`, icon: Truck },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Boxes,
    items: [
      { label: 'Raw Stock', href: `${ADMIN_BASE}/inventory`, icon: Archive },
      { label: 'Finished Products', href: `${ADMIN_BASE}/products`, icon: Package },
      { label: 'Low Stock Alerts', href: `${SUPER_BASE}/materials?lowStock=true`, icon: AlertTriangle },
    ],
  },
  {
    id: 'finance',
    label: 'Finance & CFO',
    icon: DollarSign,
    items: [
      { label: 'CFO Dashboard', href: `${SUPER_BASE}/financials`, icon: BarChart2 },
      { label: 'Profit Analytics', href: `${SUPER_BASE}/profit-intelligence`, icon: TrendingUp },
      { label: 'Cost Breakdown', href: `${SUPER_BASE}/costing-engine`, icon: Calculator },
      { label: 'Financial Health', href: `${SUPER_BASE}/financials`, icon: Activity },
    ],
  },
  {
    id: 'store',
    label: 'Store',
    icon: ShoppingCart,
    items: [
      { label: 'Orders', href: `${ADMIN_BASE}/orders`, icon: ShoppingCart },
      { label: 'Customers', href: `${ADMIN_BASE}/customers`, icon: Users },
      { label: 'Reviews', href: `${ADMIN_BASE}/reviews`, icon: Star },
      { label: 'Marketing', href: `${ADMIN_BASE}/marketing`, icon: Megaphone },
      { label: 'Support', href: `${ADMIN_BASE}/support`, icon: HeadphonesIcon },
      { label: 'Content', href: `${ADMIN_BASE}/content`, icon: FileText },
      { label: 'Analytics', href: `${ADMIN_BASE}/analytics`, icon: BarChart2 },
    ],
  },
  {
    id: 'team',
    label: 'Team & Settings',
    icon: UserCheck,
    items: [
      { label: 'Staff Management', href: `${SUPER_BASE}/staff`, icon: UserCheck },
      { label: 'Store Settings', href: `${SUPER_BASE}/settings`, icon: Settings },
      { label: 'Audit Logs', href: `${SUPER_BASE}/audit-logs`, icon: ClipboardList },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function groupContainsPath(group: NavGroup, pathname: string): boolean {
  return group.items.some(item => pathname.startsWith(item.href.split('?')[0]));
}

// ── Components ───────────────────────────────────────────────────────────────

const NavItem = ({ label, href, icon: Icon }: NavItem) => (
  <NavLink
    to={href}
    end={href.endsWith('dashboard')}
    className={({ isActive }) => cn(
      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-sans transition-all duration-150 group',
      isActive
        ? 'bg-gold-500/15 text-gold-400 font-medium'
        : 'text-charcoal-400 hover:text-white hover:bg-white/5',
    )}
  >
    <Icon size={14} className="flex-shrink-0 opacity-80" />
    <span className="truncate">{label}</span>
  </NavLink>
);

const GroupSection = ({
  group,
  isOpen,
  onToggle,
}: {
  group: NavGroup;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { icon: GroupIcon } = group;

  return (
    <div className="mb-1">
      {/* Group header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider font-sans transition-all duration-150',
          isOpen ? 'text-white bg-white/5' : 'text-charcoal-500 hover:text-charcoal-300 hover:bg-white/5',
        )}
      >
        <GroupIcon size={14} className={cn('flex-shrink-0 transition-colors', isOpen ? 'text-gold-400' : 'text-charcoal-500')} />
        <span className="flex-1 text-left">{group.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <ChevronRight size={12} className="opacity-60" />
        </motion.div>
      </button>

      {/* Group items */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pl-3 pr-1 pt-0.5 pb-1 border-l border-charcoal-800 ml-4 space-y-0.5">
              {group.items.map(item => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main sidebar ─────────────────────────────────────────────────────────────

interface AdminSidebarProps { isSuperAdmin?: boolean; }

export const AdminSidebar = ({ isSuperAdmin = false }: AdminSidebarProps) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // Auto-open the group that contains the current route
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    SUPER_GROUPS.forEach(g => {
      if (groupContainsPath(g, location.pathname)) initial.add(g.id);
    });
    if (initial.size === 0 && SUPER_GROUPS.length > 0) initial.add(SUPER_GROUPS[0].id);
    return initial;
  });

  // When route changes, ensure the containing group is open
  useEffect(() => {
    SUPER_GROUPS.forEach(g => {
      if (groupContainsPath(g, location.pathname)) {
        setOpenGroups(prev => new Set([...prev, g.id]));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className="w-60 bg-charcoal-950 text-white flex flex-col flex-shrink-0 border-r border-charcoal-900">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-charcoal-900">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gold-500/20 flex items-center justify-center">
            <Shield size={14} className="text-gold-400" />
          </div>
          <div>
            <span className="font-display text-lg tracking-[0.25em] text-white">ELUNORA</span>
            <span className="ml-2 text-[9px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded font-sans tracking-widest uppercase">
              {isSuperAdmin ? 'Super' : 'Admin'}
            </span>
          </div>
        </Link>
        <p className="text-charcoal-500 text-[11px] mt-2 font-sans truncate">{user?.name}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 no-scrollbar space-y-0.5">
        {!isSuperAdmin ? (
          <>
            <p className="text-[10px] text-charcoal-600 uppercase tracking-widest px-3 mb-2 font-sans mt-1">Management</p>
            {ADMIN_NAV.map(item => <NavItem key={item.href} {...item} />)}
          </>
        ) : (
          <>
            {/* Founder Dashboard — top-level direct link */}
            <NavLink
              to={`${SUPER_BASE}/dashboard`}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-sans font-medium transition-all duration-150 mb-2',
                isActive
                  ? 'bg-gold-500/15 text-gold-400'
                  : 'text-charcoal-300 hover:text-white hover:bg-white/5',
              )}
            >
              <LayoutDashboard size={15} className="text-gold-500/70" />
              Founder Dashboard
            </NavLink>

            <NavLink
              to={`${SUPER_BASE}/financials`}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-sans font-medium transition-all duration-150 mb-3',
                isActive
                  ? 'bg-gold-500/15 text-gold-400'
                  : 'text-charcoal-300 hover:text-white hover:bg-white/5',
              )}
            >
              <Banknote size={15} className="text-gold-500/70" />
              CFO Dashboard
            </NavLink>

            <div className="h-px bg-charcoal-900 mx-2 mb-3" />

            {SUPER_GROUPS.map(group => (
              <GroupSection
                key={group.id}
                group={group}
                isOpen={openGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
              />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-charcoal-900">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2.5 text-charcoal-500 hover:text-white hover:bg-white/5 rounded-lg text-[13px] font-sans w-full transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, Search, Heart, User } from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';

const LEFT_ITEMS = [
  { label: 'Home',    href: '/',         icon: Home },
  { label: 'Shop',    href: '/products', icon: ShoppingBag },
];
const RIGHT_ITEMS = [
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Account',  href: '/account',  icon: User },
];

export const MobileBottomNav = () => {
  const location  = useLocation();
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openSearch } = useUIStore();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  const hide =
    location.pathname.includes('/elva-admin') ||
    location.pathname.includes('/elva-superadmin') ||
    location.pathname.includes('/checkout');
  if (hide) return null;

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const NavItem = ({ label, href, icon: Icon }: { label: string; href: string; icon: any }) => {
    const active = isActive(href);
    const isShop = href === '/products';
    const actualHref = href === '/account' && !isAuthenticated ? '/login' : href;

    return (
      <Link to={actualHref} className="relative flex flex-col items-center justify-center gap-[3px] flex-1 py-2">
        {active && (
          <motion.div
            layoutId="nav-glow"
            className="absolute inset-x-2 inset-y-1.5 rounded-[18px]"
            style={{ background: 'rgba(212,168,83,0.13)' }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          />
        )}
        <motion.div
          whileTap={{ scale: 0.78 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="relative z-10 flex flex-col items-center gap-[3px]"
        >
          <div className="relative">
            <Icon
              size={20}
              strokeWidth={active ? 2.2 : 1.5}
              style={{ color: active ? '#D4A853' : 'rgba(255,255,255,0.36)' }}
            />
            {isShop && cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1.5 w-[14px] h-[14px] rounded-full text-[7px] flex items-center justify-center font-bold text-white"
                style={{ background: '#C4607A', boxShadow: '0 2px 6px rgba(196,96,122,0.5)' }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </div>
          <span
            className="text-[9px] font-sans font-semibold tracking-wide"
            style={{ color: active ? '#D4A853' : 'rgba(255,255,255,0.3)' }}
          >
            {label}
          </span>
        </motion.div>

        {/* Active dot below label */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-1 w-4 h-[2px] rounded-full"
              style={{ background: 'linear-gradient(to right, #C4607A, #D4A853)' }}
            />
          )}
        </AnimatePresence>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 md:hidden">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-[26px] pointer-events-none"
        style={{ boxShadow: '0 0 0 1px rgba(212,168,83,0.12), 0 12px 48px rgba(0,0,0,0.5), 0 4px 20px rgba(196,96,122,0.14)' }}
      />

      <div
        className="relative flex items-center rounded-[26px]"
        style={{
          background: 'rgba(18,4,11,0.92)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.07)',
          WebkitBackdropFilter: 'blur(28px)',
        }}
      >
        {/* Gold hairline top */}
        <div className="absolute top-0 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(212,168,83,0.3), transparent)' }} />

        {/* Left items */}
        <div className="flex flex-1 h-[68px]">
          {LEFT_ITEMS.map(item => <NavItem key={item.href} {...item} />)}
        </div>

        {/* Centre — raised Search button */}
        <div className="relative flex flex-col items-center justify-end h-[68px] px-2" style={{ transform: 'translateY(-16px)' }}>
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 460, damping: 22 }}
            onClick={openSearch}
            className="relative w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8B2D4E 0%, #C4607A 55%, #D4A853 100%)',
              boxShadow: '0 8px 32px rgba(196,96,122,0.4), 0 4px 16px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.3)',
            }}
          >
            {/* Inner glow ring */}
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
            <Search size={24} color="white" strokeWidth={2} className="relative z-10 drop-shadow-md" />
          </motion.button>
          
          <span 
            className="absolute -bottom-1 w-full text-center text-[9px] font-sans font-semibold tracking-wide"
            style={{ color: 'rgba(255,255,255,0.3)', transform: 'translateY(12px)' }}
          >
            Search
          </span>
        </div>

        {/* Right items */}
        <div className="flex flex-1 h-[68px]">
          {RIGHT_ITEMS.map(item => <NavItem key={item.href} {...item} />)}
        </div>
      </div>
    </div>
  );
};

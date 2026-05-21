import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useAuthStore } from '@store/authStore';
import { cn } from '@utils/cn';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Shop', href: '/products', icon: ShoppingBag },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Account', href: '/account', icon: User },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  // Hide on admin routes and checkout
  const hide = location.pathname.includes('/elva-admin') || location.pathname.includes('/checkout');
  if (hide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-charcoal-100 safe-area-pb">
      <div className="flex items-center justify-around px-2 pt-2 pb-safe">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);
          const isAccount = href === '/account';
          const actualHref = isAccount && !isAuthenticated ? '/login' : href;

          return (
            <Link
              key={href}
              to={actualHref}
              className="flex flex-col items-center gap-1 min-w-[48px] py-1 relative"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? 'text-charcoal-950' : 'text-charcoal-400',
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {label === 'Shop' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] font-sans transition-colors duration-200',
                  isActive ? 'text-charcoal-950 font-medium' : 'text-charcoal-400',
                )}
              >
                {label}
              </span>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold-500 rounded-full"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';
import { cn } from '@utils/cn';

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/products?sort=new' },
  { label: 'Best Sellers', href: '/products?sort=bestseller' },
  {
    label: 'Collections',
    href: '#',
    submenu: [
      { label: 'Premium Candles', href: '/category/premium-candles', emoji: '🕯️' },
      { label: 'Personalized Gifts', href: '/category/personalized-gifts', emoji: '🎁' },
      { label: 'Clay Art', href: '/category/clay-art', emoji: '🏺' },
      { label: 'Home Decor', href: '/category/home-decor', emoji: '🏡' },
      { label: 'Couple Collections', href: '/category/couple-collections', emoji: '💑' },
      { label: 'Wedding Collections', href: '/category/wedding-collections', emoji: '💍' },
      { label: 'Festival Collections', href: '/category/festival-collections', emoji: '🎊' },
      { label: 'Corporate Gifting', href: '/category/corporate-gifting', emoji: '💼' },
      { label: 'Luxury Hampers', href: '/category/luxury-hampers', emoji: '🧺' },
      { label: 'Subscription Boxes', href: '/category/subscription-boxes', emoji: '📦' },
    ],
  },
  { label: 'Gift Finder', href: '/gift-finder' },
  { label: 'About', href: '/about' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { itemCount } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { openSearch, openCart } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-luxury' : 'bg-transparent',
    )}>
      {/* Top announcement bar */}
      <div className="bg-charcoal-950 text-white text-center py-2 text-xs tracking-widest uppercase font-sans">
        Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; Handcrafted with Love 🤍
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="font-display text-3xl tracking-[0.4em] text-charcoal-950 font-light">ELVA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <div
                key={link.label}
                className="relative group"
                onMouseEnter={() => link.submenu && setActiveMenu(link.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <NavLink
                  to={link.href}
                  className="flex items-center gap-1 text-sm font-sans font-medium text-charcoal-700 hover:text-charcoal-950 tracking-wide transition-colors"
                >
                  {link.label}
                  {link.submenu && <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />}
                </NavLink>

                {link.submenu && activeMenu === link.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50"
                  >
                    <div className="bg-white shadow-card-hover border border-charcoal-100 p-6 w-80 grid grid-cols-2 gap-2">
                      {link.submenu.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="flex items-center gap-2 p-2 hover:bg-cream-100 text-sm text-charcoal-700 hover:text-charcoal-950 transition-colors rounded"
                        >
                          <span>{item.emoji}</span>
                          <span className="font-sans">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <button onClick={openSearch} className="p-2 text-charcoal-700 hover:text-charcoal-950 transition-colors">
              <Search size={20} />
            </button>

            <Link to="/wishlist" className="p-2 text-charcoal-700 hover:text-charcoal-950 transition-colors">
              <Heart size={20} />
            </Link>

            {isAuthenticated ? (
              <button
                onClick={() => navigate(user?.role !== 'customer' ? '/admin' : '/account')}
                className="p-2 text-charcoal-700 hover:text-charcoal-950 transition-colors"
              >
                <User size={20} />
              </button>
            ) : (
              <Link to="/login" className="p-2 text-charcoal-700 hover:text-charcoal-950 transition-colors">
                <User size={20} />
              </Link>
            )}

            <button onClick={openCart} className="p-2 text-charcoal-700 hover:text-charcoal-950 transition-colors relative">
              <ShoppingBag size={20} />
              {itemCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {itemCount() > 9 ? '9+' : itemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-charcoal-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link
                    to={link.href}
                    className="block text-sm font-sans font-medium text-charcoal-700 py-2 tracking-wide"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {link.submenu && (
                    <div className="pl-4 mt-2 space-y-2">
                      {link.submenu.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className="flex items-center gap-2 text-sm text-charcoal-500 py-1"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span>{item.emoji}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

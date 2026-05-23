import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Heart, Search, User, Menu, X,
  ChevronDown, Sparkles, ArrowRight,
} from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';
import { cn } from '@utils/cn';
import { ADMIN_BASE, SUPER_BASE } from '@config/admin';

// ── Data ──────────────────────────────────────────────────────────────────────

const MARQUEE_MSGS = [
  '✦  Free Shipping on Orders Above ₹999',
  '✦  Handcrafted with Love in India',
  '✦  New Arrivals Every Friday',
  '✦  Use ELVA10 for 10% Off Your First Order',
  '✦  Premium Gifting · Ethically Made',
];

const COLLECTIONS = [
  { label: 'Premium Candles',      href: '/category/premium-candles',      emoji: '🕯️', desc: 'Soy & beeswax blends' },
  { label: 'Personalized Gifts',   href: '/category/personalized-gifts',   emoji: '🎁', desc: 'Made just for them' },
  { label: 'Clay Art',             href: '/category/clay-art',             emoji: '🏺', desc: 'Handcrafted pieces' },
  { label: 'Home Decor',           href: '/category/home-decor',           emoji: '🏡', desc: 'Elevate your space' },
  { label: 'Couple Collections',   href: '/category/couple-collections',   emoji: '💑', desc: 'Gifts for two' },
  { label: 'Wedding Collections',  href: '/category/wedding-collections',  emoji: '💍', desc: 'Celebrate forever' },
  { label: 'Festival Collections', href: '/category/festival-collections', emoji: '🎊', desc: 'Diwali · Holi · Eid' },
  { label: 'Corporate Gifting',    href: '/category/corporate-gifting',    emoji: '💼', desc: 'Bulk & bespoke' },
  { label: 'Luxury Hampers',       href: '/category/luxury-hampers',       emoji: '🧺', desc: 'Curated sets' },
  { label: 'Subscription Boxes',   href: '/category/subscription-boxes',   emoji: '📦', desc: 'Delight every month' },
];

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/products?sort=new' },
  { label: 'Best Sellers', href: '/products?sort=bestseller' },
  { label: 'Collections',  href: '#', mega: true },
  { label: 'Gift Finder',  href: '/gift-finder' },
  { label: 'About',        href: '/about' },
];

// ── Announcement bar ──────────────────────────────────────────────────────────

const AnnouncementBar = ({ visible }: { visible: boolean }) => {
  const msgs = [...MARQUEE_MSGS, ...MARQUEE_MSGS, ...MARQUEE_MSGS];
  return (
    <motion.div
      animate={{ height: visible ? 'auto' : 0, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: 'hidden', background: '#1E0812' }}
    >
      <div className="relative overflow-hidden py-[9px]">
        <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #1E0812 0%, transparent 100%)' }} />
        <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #1E0812 0%, transparent 100%)' }} />
        <motion.div
          className="flex gap-14 whitespace-nowrap w-max"
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {msgs.map((m, i) => (
            <span key={i} className="text-[11px] tracking-[0.18em] uppercase font-sans font-medium flex-shrink-0"
              style={{ color: '#D4A853' }}>{m}</span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

// ── Mega menu ─────────────────────────────────────────────────────────────────
// Rendered at the nav-container level so it's never clipped by a parent element.

const MegaMenu = ({ onClose, onMouseEnter }: { onClose: () => void; onMouseEnter?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -6, scale: 0.98 }}
    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    className="absolute top-full left-0 right-0 z-50 flex justify-center px-4 pt-3 pb-6"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onClose}
  >
    {/* Arrow notch */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex justify-center w-full pointer-events-none" style={{ top: 3 }}>
      <div
        className="w-3 h-3 bg-white border-l border-t border-charcoal-100 rotate-45"
        style={{ boxShadow: '-1px -1px 3px rgba(0,0,0,0.06)' }}
      />
    </div>

    {/* Panel */}
    <div
      className="w-full rounded-2xl overflow-hidden flex"
      style={{
        maxWidth: 860,
        boxShadow: '0 20px 60px rgba(30,8,18,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(212,168,83,0.12)',
      }}
    >
      {/* ── Left brand panel ── */}
      <div
        className="w-[240px] flex-shrink-0 p-7 flex flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1E0812 0%, #2C1224 50%, #3D1A35 100%)' }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(196,96,122,0.18) 0%, transparent 70%)' }} />

        <div className="relative z-10 space-y-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.2)' }}>
            <Sparkles size={15} style={{ color: '#D4A853' }} />
          </div>
          <div>
            <p className="font-display text-[26px] text-white font-light leading-tight">Explore</p>
            <p className="font-display text-[26px] font-light leading-tight" style={{ color: '#D4A853' }}>Collections</p>
          </div>
          <p className="text-[12px] font-sans leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Every piece handcrafted with intention, designed to be gifted.
          </p>
        </div>

        <Link
          to="/products" onClick={onClose}
          className="relative z-10 inline-flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.15em] transition-all group mt-6"
          style={{ color: '#D4A853' }}
        >
          View All
          <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      {/* ── Collections grid ── */}
      <div className="flex-1 bg-white p-5 grid grid-cols-2 gap-0.5 content-start">
        {COLLECTIONS.map(item => (
          <Link
            key={item.label}
            to={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all duration-150 hover:bg-[#fdf5f7]"
          >
            <span className="text-[22px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3">
              {item.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-sans font-medium text-charcoal-900 truncate leading-snug">
                {item.label}
              </p>
              <p className="text-[11px] font-sans text-charcoal-400 truncate mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </motion.div>
);

// ── Icon button ───────────────────────────────────────────────────────────────

const IconBtn = ({
  onClick, children, badge, as: Tag = 'button', href, light,
}: {
  onClick?: () => void; children: React.ReactNode; badge?: number;
  as?: any; href?: string; light?: boolean;
}) => {
  const props: any = { onClick, className: cn('relative p-2 transition-colors', light ? 'text-white/90 hover:text-white' : 'text-charcoal-600 hover:text-charcoal-950') };
  if (href) props.to = href;

  const inner = (
    <>
      {children}
      <AnimatePresence mode="popLayout">
        {badge !== undefined && badge > 0 && (
          <motion.span
            key={badge}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
            className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-white text-[9px] flex items-center justify-center font-bold font-sans"
            style={{ background: '#D4A853' }}
          >
            {badge > 9 ? '9+' : badge}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }} className="inline-flex">
      <Tag {...props}>{inner}</Tag>
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCollOpen, setMobileCollOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { itemCount } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { openSearch, openCart } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setMegaOpen(false); }, [location.pathname]);

  const openMega = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMegaOpen(true); };
  const closeMega = () => { closeTimer.current = setTimeout(() => setMegaOpen(false), 200); };

  const goProfile = () => {
    if (!user) return navigate('/login');
    if (user.role === 'super_admin') navigate(`${SUPER_BASE}/dashboard`);
    else if (user.role !== 'customer') navigate(`${ADMIN_BASE}/dashboard`);
    else navigate('/account');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40">
        {/* Announcement bar */}
        <AnnouncementBar visible={!scrolled} />

        {/* Nav strip */}
        <motion.div
          animate={scrolled
            ? { backgroundColor: 'rgba(14,3,11,0.90)', boxShadow: '0 1px 0 rgba(212,168,83,0.12), 0 8px 32px rgba(0,0,0,0.45)' }
            : { backgroundColor: 'rgba(14,3,11,0.18)', boxShadow: 'none' }
          }
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/*
            Key: nav wrapper is `relative` — mega menu is absolute-positioned inside it,
            spanning the full container width, so it's never clipped by the nav item.
          */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-center justify-between h-[62px] lg:h-[68px]">

              {/* Mobile toggle */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setMobileOpen(v => !v)}
                className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen
                    ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }}><X size={20} /></motion.span>
                    : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.14 }}><Menu size={20} /></motion.span>
                  }
                </AnimatePresence>
              </motion.button>

              {/* Logo */}
              <Link to="/" className="flex-shrink-0 group select-none">
                <motion.span
                  whileHover={{ letterSpacing: '0.52em' }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="font-display font-light text-[27px] tracking-[0.44em] inline-block"
                  style={{ color: 'white' }}
                >
                  ELVA
                </motion.span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-8" onMouseLeave={closeMega}>
                {NAV_LINKS.map(link => (
                  <div key={link.label} onMouseEnter={link.mega ? openMega : closeMega}>
                    <NavLink
                      to={link.href}
                      className={({ isActive }) => cn(
                        'relative flex items-center gap-1 text-[13px] font-sans font-medium tracking-wide transition-colors duration-150 py-1 group',
                        isActive ? 'text-white' : 'text-white/70 hover:text-white',
                      )}
                    >
                      {({ isActive }) => (
                        <>
                          {link.label}
                          {link.mega && (
                            <motion.span animate={{ rotate: megaOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown size={12} className={scrolled ? 'opacity-50' : 'opacity-60'} />
                            </motion.span>
                          )}
                          {/* Animated underline */}
                          <motion.span
                            className="absolute -bottom-0.5 left-0 right-0 h-px rounded-full"
                            style={{ background: '#D4A853' }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: (isActive || (link.mega && megaOpen)) ? 1 : 0 }}
                            transition={{ duration: 0.22 }}
                          />
                        </>
                      )}
                    </NavLink>
                  </div>
                ))}

                {/* Mega menu — spans full container width, never clips */}
                <AnimatePresence>
                  {megaOpen && <MegaMenu onMouseEnter={openMega} onClose={closeMega} />}
                </AnimatePresence>
              </nav>

              {/* Right icons */}
              <div className="flex items-center gap-0.5">
                {/* Desktop only — bottom nav handles these on mobile */}
                <span className="hidden md:inline-flex items-center gap-0.5">
                  <IconBtn onClick={openSearch} light><Search size={18} strokeWidth={1.8} /></IconBtn>
                  <IconBtn as={Link} href="/wishlist" light><Heart size={18} strokeWidth={1.8} /></IconBtn>
                  <IconBtn onClick={goProfile} light><User size={18} strokeWidth={1.8} /></IconBtn>
                </span>
                {/* Cart always visible */}
                <IconBtn onClick={openCart} badge={itemCount()} light>
                  <ShoppingBag size={18} strokeWidth={1.8} />
                </IconBtn>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Gold hairline separator */}
        <div
          className="h-px"
          style={{ background: 'linear-gradient(to right, transparent 0%, rgba(212,168,83,0.22) 30%, rgba(212,168,83,0.22) 70%, transparent 100%)' }}
        />
      </header>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-30 lg:hidden flex flex-col"
            style={{ background: 'rgba(22,5,14,0.97)', backdropFilter: 'blur(20px)' }}
          >
            {/* Top safe area */}
            <div className="h-[calc(62px+var(--announce-h,32px))]" />

            <div className="flex flex-col flex-1 px-7 pt-6 pb-10 overflow-y-auto">
              <nav className="flex flex-col gap-0.5">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ x: 32, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 32, opacity: 0 }}
                    transition={{ delay: i * 0.055, duration: 0.28, ease: 'easeOut' }}
                  >
                    {link.mega ? (
                      <div>
                        <button
                          onClick={() => setMobileCollOpen(v => !v)}
                          className="flex items-center justify-between w-full py-4 border-b border-white/8 text-left"
                        >
                          <span className="font-display text-[28px] font-light text-white">{link.label}</span>
                          <motion.span animate={{ rotate: mobileCollOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={18} className="text-white/40" />
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {mobileCollOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="grid grid-cols-2 gap-0.5 py-3">
                                {COLLECTIONS.map(col => (
                                  <Link key={col.label} to={col.href} onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                    <span className="text-lg">{col.emoji}</span>
                                    <div>
                                      <p className="text-[13px] font-sans text-white/80 leading-snug">{col.label}</p>
                                      <p className="text-[10px] font-sans text-white/35">{col.desc}</p>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-4 border-b border-white/8 font-display text-[28px] font-light text-white hover:text-amber-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Bottom actions */}
              <motion.div
                initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }} transition={{ delay: 0.32 }}
                className="mt-auto pt-8 flex items-center justify-between border-t border-white/10"
              >
                <div className="flex items-center gap-3">
                  {[
                    { icon: <Search size={18} />, action: () => { setMobileOpen(false); openSearch(); } },
                    { icon: <Heart size={18} />, action: () => { setMobileOpen(false); navigate('/wishlist'); } },
                    { icon: <User size={18} />, action: () => { setMobileOpen(false); goProfile(); } },
                  ].map((btn, i) => (
                    <motion.button key={i} onClick={btn.action} whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-xl border border-white/12 flex items-center justify-center text-white/60 hover:text-white hover:border-white/25 transition-colors">
                      {btn.icon}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setMobileOpen(false); openCart(); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-sans font-semibold"
                  style={{ background: '#D4A853', color: '#1E0812' }}
                >
                  <ShoppingBag size={16} strokeWidth={2} />
                  Bag {itemCount() > 0 && `· ${itemCount()}`}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

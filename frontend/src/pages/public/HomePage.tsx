import { useRef, useEffect, useState } from 'react';
import {
  motion, useScroll, useTransform, useInView, AnimatePresence,
  useMotionValue, useSpring,
} from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Gift, Star, Truck, RefreshCw, Shield } from 'lucide-react';
import { productsApi, categoriesApi } from '@api/products.api';
import { ProductCard } from '@components/products/ProductCard';
import { CategoryCard } from '@components/categories/CategoryCard';
import { AnimatedCounter } from '@components/ui/AnimatedCounter';

const HERO_WORDS = ['Cherish', 'Celebrate', 'Personalise', 'Gift'];

const MARQUEE_ITEMS = [
  '✦ HANDCRAFTED WITH LOVE', '✦ 50,000+ HAPPY CUSTOMERS', '✦ PERSONALIZED GIFTS',
  '✦ PAN-INDIA DELIVERY', '✦ PREMIUM QUALITY', '✦ 500+ UNIQUE PRODUCTS',
  "✦ INDIA'S FINEST BRAND", '✦ 4.9★ RATED',
];

const FEATURES = [
  { icon: Gift, title: 'Handcrafted with Love', description: 'Every piece made by skilled artisans', color: '#E87B6A' },
  { icon: Truck, title: 'Free Shipping ₹999+', description: 'Pan-India delivery in 5–7 days', color: '#D4A853' },
  { icon: RefreshCw, title: 'Easy Returns', description: '7-day hassle-free return policy', color: '#9B5E7C' },
  { icon: Shield, title: 'Secure Payments', description: 'Razorpay & UPI — 100% secure', color: '#5E8F7C' },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Happy Customers', icon: '🧡' },
  { value: 500, suffix: '+', label: 'Unique Products', icon: '✨' },
  { value: 100, suffix: '%', label: 'Handcrafted', icon: '🤍' },
  { value: 4.9, suffix: '★', label: 'Average Rating', decimals: 1, icon: '⭐' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma', city: 'Mumbai', rating: 5,
    review: "The personalized candle I ordered for my sister's wedding was absolutely stunning. The quality exceeded all expectations!",
    product: 'Luxury Personalized Candle', color: '#FFF0F3',
  },
  {
    name: 'Arjun Mehta', city: 'Bangalore', rating: 5,
    review: "ELVA's corporate gifting service is unmatched. Our clients were blown away by the premium packaging and quality.",
    product: 'Corporate Gift Hamper', color: '#FFF8F0',
  },
  {
    name: 'Sneha Patel', city: 'Ahmedabad', rating: 5,
    review: 'Ordered clay art as a Diwali gift — received it in beautiful packaging with a personal note. Will definitely order again!',
    product: 'Handcrafted Clay Art', color: '#F5F0FF',
  },
];

const HERO_CARDS = [
  { label: 'Personalized Candle', price: '₹899', top: '2%', left: '8%', rotate: -7, delay: 0.5, bg: '#FFF0F3', emoji: '🕯️' },
  { label: 'Clay Art Duo', price: '₹1,299', top: '28%', left: '46%', rotate: 5, delay: 0.65, bg: '#FFF8F0', emoji: '🏺' },
  { label: 'Luxury Hamper', price: '₹2,499', top: '57%', left: '4%', rotate: -4, delay: 0.8, bg: '#F5F0FF', emoji: '🧺' },
  { label: 'Gift Voucher', price: '₹500', top: '72%', left: '52%', rotate: 6, delay: 0.95, bg: '#F0FFF6', emoji: '🎁' },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const { data: featuredProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getFeatured().then((r) => r.data.data),
  });
  const { data: newArrivals } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productsApi.getNewArrivals().then((r) => r.data.data),
  });
  const { data: categories } = useQuery({
    queryKey: ['categories', 'featured'],
    queryFn: () => categoriesApi.getFeatured().then((r) => r.data.data),
  });

  return (
    <div className="overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #FDF6EE 0%, #FFF0F5 40%, #FBF2EC 70%, #F5F0FF 100%)' }}
      >
        <FloatingOrbs />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32"
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="h-px w-10" style={{ background: '#C4607A' }} />
                <span
                  className="text-xs font-sans tracking-[0.35em] uppercase font-semibold"
                  style={{ color: '#C4607A' }}
                >
                  India's Finest Handcrafted Brand
                </span>
              </motion.div>

              <div className="overflow-hidden mb-1">
                <motion.h1
                  initial={{ y: 70, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display leading-none"
                  style={{ fontSize: 'clamp(60px, 7.5vw, 108px)', color: '#1A0812', letterSpacing: '-0.02em' }}
                >
                  Made to
                </motion.h1>
              </div>

              <div className="overflow-hidden mb-8" style={{ height: '1.15em' }}>
                <AnimatedWords words={HERO_WORDS} />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.7 }}
                className="font-sans text-lg leading-relaxed mb-10 max-w-lg"
                style={{ color: '#6B3A4E' }}
              >
                Every ELVA piece is a labour of love — handcrafted by skilled artisans,
                personalized for your most precious moments.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-widest uppercase font-sans transition-all duration-300"
                  style={{ background: '#1A0812', color: '#FDF6EE' }}
                >
                  Explore Collection
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
                <Link
                  to="/gift-finder"
                  className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-widest uppercase font-sans border transition-all duration-300 hover:bg-rose-50"
                  style={{ borderColor: '#C4607A', color: '#C4607A' }}
                >
                  <Gift size={15} />
                  Find Perfect Gift
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95, duration: 0.7 }}
                className="flex items-center gap-8 mt-12 pt-10 border-t"
                style={{ borderColor: '#EAD0DA' }}
              >
                {[
                  { n: '50K+', l: 'Customers' },
                  { n: '4.9★', l: 'Avg Rating' },
                  { n: '500+', l: 'Products' },
                ].map((item) => (
                  <div key={item.l}>
                    <div className="font-display text-2xl" style={{ color: '#C4607A' }}>{item.n}</div>
                    <div className="font-sans text-xs tracking-wide uppercase mt-0.5" style={{ color: '#9B7080' }}>{item.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: 3D floating card cluster */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="font-sans text-[10px] tracking-[0.35em] uppercase" style={{ color: '#B08090' }}>Scroll</span>
          <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, #C4607A, transparent)' }} />
        </motion.div>
      </section>

      {/* ===== MARQUEE ===== */}
      <div className="py-4 overflow-hidden" style={{ background: '#1E0812' }}>
        <MarqueeStrip items={MARQUEE_ITEMS} />
      </div>

      {/* ===== STATS ===== */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #FFF9F2 50%, #F8F5FF 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Collections"
            title="Shop by Category"
            subtitle="From personalized gifts to luxury hampers — discover what makes your moments unforgettable."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
            {(categories || PLACEHOLDER_CATEGORIES).slice(0, 8).map((cat: any, i: number) => (
              <CategoryCard key={cat.id || i} category={cat} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/products" className="btn-outline">
              View All Collections <ArrowRight size={13} className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section
        className="py-20 lg:py-28"
        style={{ background: 'linear-gradient(160deg, #FDF6EE 0%, #FFF5F7 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Curated for You"
            title="Featured Products"
            subtitle="Our most-loved, handpicked products — crafted for those who appreciate the finest things."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
            {(featuredProducts || PLACEHOLDER_PRODUCTS).slice(0, 8).map((product: any, i: number) => (
              <ProductCard key={product.id || i} product={product} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/products?isFeatured=true" className="btn-primary">
              Explore All <ArrowRight size={13} className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STORY SECTION ===== */}
      <section
        className="py-20 lg:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 55%, #1A0820 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <p
                className="text-xs font-sans tracking-[0.4em] uppercase mb-6 font-semibold"
                style={{ color: '#D4A853' }}
              >
                Our Story
              </p>
              <h2
                className="font-display leading-tight mb-8 text-white"
                style={{ fontSize: 'clamp(34px, 4vw, 54px)' }}
              >
                Every Gift Tells<br />a Beautiful Story
              </h2>
              <p className="font-sans text-lg leading-relaxed mb-6" style={{ color: '#C8A8B8' }}>
                ELVA was born from a simple belief: the most meaningful gifts are the ones
                made by hand, with love, and personalized for the person you cherish most.
              </p>
              <p className="font-sans leading-relaxed mb-10" style={{ color: '#8A6070' }}>
                Our artisans spend countless hours perfecting every detail — from hand-poured
                candles to intricate clay sculptures — ensuring each ELVA piece is worthy of
                your most precious moments.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-widest uppercase font-sans transition-all duration-300 hover:gap-5"
                style={{ background: '#D4A853', color: '#1E0812' }}
              >
                Our Story <ArrowRight size={15} />
              </Link>
            </FadeInView>

            <FadeInView delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] overflow-hidden rounded-sm" style={{ background: '#2E1428' }}>
                    <img
                      src="/story/artisan-1.svg"
                      alt="Artisan"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 rounded-sm border" style={{ borderColor: '#4A2038', background: 'rgba(212,168,83,0.07)' }}>
                    <p className="font-display text-2xl mb-1" style={{ color: '#D4A853' }}>50,000+</p>
                    <p className="font-sans text-xs" style={{ color: '#8A6070' }}>Gifts Delivered</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="p-6 rounded-sm border" style={{ borderColor: '#4A2038', background: 'rgba(196,96,122,0.07)' }}>
                    <p className="font-display text-2xl mb-1" style={{ color: '#D4A853' }}>100%</p>
                    <p className="font-sans text-xs" style={{ color: '#8A6070' }}>Handcrafted</p>
                  </div>
                  <div className="aspect-[3/4] overflow-hidden rounded-sm" style={{ background: '#2E1428' }}>
                    <img
                      src="/story/artisan-2.svg"
                      alt="Craft"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Just In"
            title="New Arrivals"
            subtitle="Fresh from our artisans' hands — be the first to own something truly special."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
            {(newArrivals || PLACEHOLDER_PRODUCTS).slice(0, 4).map((product: any, i: number) => (
              <ProductCard key={product.id || i} product={product} index={i} showNewBadge />
            ))}
          </div>
        </div>
      </section>

      {/* ===== GIFT FINDER BANNER ===== */}
      <section
        className="py-20 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #8B2D4E 0%, #C4607A 38%, #E8806A 68%, #D4A853 100%)' }}
      >
        {/* Floating emojis */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['🎁', '✨', '💝', '🌸', '🕯️', '💛', '🎀', '🌟'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl select-none"
              style={{
                left: `${8 + i * 11}%`,
                top: `${20 + (i % 3) * 25}%`,
                opacity: 0.18,
              }}
              animate={{
                y: [0, -18, 0],
                rotate: [0, 12, -10, 0],
                scale: [1, 1.12, 1],
              }}
              transition={{
                duration: 3 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeInOut',
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <p className="text-xs font-sans tracking-[0.4em] uppercase mb-5 font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Not Sure What to Gift?
            </p>
            <h2
              className="font-display text-white mb-6"
              style={{ fontSize: 'clamp(34px, 5vw, 66px)', lineHeight: 1.08 }}
            >
              Use Our AI Gift Finder
            </h2>
            <p className="font-sans text-lg mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.78)' }}>
              Tell us about the person and occasion — our AI-powered Gift Finder will
              recommend the perfect ELVA piece.
            </p>
            <Link
              to="/gift-finder"
              className="inline-flex items-center gap-3 px-10 py-5 text-sm font-semibold tracking-widest uppercase font-sans transition-all duration-300 hover:gap-5 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#8B2D4E' }}
            >
              <Gift size={17} />
              Find the Perfect Gift
              <ArrowRight size={15} />
            </Link>
          </FadeInView>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section
        className="py-20 lg:py-28"
        style={{ background: 'linear-gradient(135deg, #FFF8F2 0%, #FFF0F5 50%, #F8F5FF 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Customer Love"
            title="What Our Customers Say"
            subtitle="Real stories from real people — because every gift has a story worth sharing."
          />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16 bg-white border-t border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color }, i) => (
              <FeatureCard
                key={title}
                icon={Icon}
                title={title}
                description={description}
                color={color}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E0812 0%, #3A1428 55%, #1A0820 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(196,96,122,0.15) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInView>
            <p className="text-xs font-sans tracking-[0.4em] uppercase mb-4 font-semibold" style={{ color: '#D4A853' }}>
              Join the ELVA Circle
            </p>
            <h2
              className="font-display text-white mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 46px)' }}
            >
              Get Exclusive Access
            </h2>
            <p className="font-sans mb-8" style={{ color: '#8A6070' }}>
              Be the first to know about new collections, limited editions, and exclusive
              offers. Plus, get ₹100 off your first order.
            </p>
            <form
              className="flex max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 text-sm focus:outline-none font-sans"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(196,96,122,0.28)',
                  borderRight: 'none',
                  color: '#F0D8E0',
                }}
              />
              <button
                type="submit"
                className="px-6 py-4 text-xs font-semibold tracking-widest uppercase font-sans transition-all duration-200 whitespace-nowrap hover:brightness-110"
                style={{ background: '#C4607A', color: 'white' }}
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs mt-4" style={{ color: '#5A3040' }}>No spam, ever. Unsubscribe anytime.</p>
          </FadeInView>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────── HELPER COMPONENTS ─────────────────────────── */

const AnimatedWords = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ y: 80, opacity: 0, skewY: 5 }}
        animate={{ y: 0, opacity: 1, skewY: 0 }}
        exit={{ y: -80, opacity: 0, skewY: -5 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="block font-display leading-none"
        style={{
          fontSize: 'clamp(60px, 7.5vw, 108px)',
          color: '#C4607A',
          letterSpacing: '-0.02em',
        }}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};

const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { cx: '78%', cy: '22%', r: 520, color: 'rgba(196,96,122,0.22)', dur: 9 },
      { cx: '88%', cy: '65%', r: 420, color: 'rgba(212,168,83,0.18)', dur: 11 },
      { cx: '8%',  cy: '72%', r: 360, color: 'rgba(155,94,124,0.14)', dur: 13 },
      { cx: '55%', cy: '85%', r: 300, color: 'rgba(232,123,106,0.13)', dur: 10 },
    ].map((o, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-3xl"
        style={{
          left: o.cx, top: o.cy,
          width: o.r, height: o.r,
          background: `radial-gradient(circle, ${o.color} 0%, transparent 72%)`,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ scale: [1, 1.18, 1], x: [0, 22, -12, 0], y: [0, -18, 12, 0] }}
        transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.8 }}
      />
    ))}
  </div>
);

const TiltCard = ({
  children, className, style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), { stiffness: 280, damping: 28 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 280, damping: 28 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ ...style, rotateX, rotateY, perspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const HeroVisual = () => (
  <div className="relative h-[600px] w-full select-none">
    <div
      className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
      style={{ background: 'radial-gradient(ellipse at 60% 50%, #C4607A 0%, transparent 70%)' }}
    />

    {HERO_CARDS.map((card, i) => (
      <TiltCard
        key={i}
        className="absolute w-52 cursor-pointer"
        style={{ top: card.top, left: card.left }}
      >
        <motion.div
          initial={{ opacity: 0, y: 45, rotate: card.rotate * 0.4 }}
          animate={{ opacity: 1, y: 0, rotate: card.rotate }}
          transition={{ delay: card.delay, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-5 border"
          style={{
            background: card.bg,
            borderColor: 'rgba(196,96,122,0.1)',
            boxShadow: '0 24px 64px rgba(196,96,122,0.14)',
          }}
        >
          <div
            className="aspect-square rounded-xl mb-4 flex items-center justify-center text-4xl"
            style={{ background: 'rgba(255,255,255,0.85)' }}
          >
            {card.emoji}
          </div>
          <p className="font-sans text-sm font-semibold mb-1" style={{ color: '#1A0812' }}>
            {card.label}
          </p>
          <p className="font-display text-xl" style={{ color: '#C4607A' }}>{card.price}</p>
        </motion.div>
      </TiltCard>
    ))}

    <motion.div
      className="absolute top-2 right-2 px-3 py-1.5 rounded-full text-xs font-sans font-bold tracking-wide"
      style={{ background: '#C4607A', color: 'white' }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      ✦ New Collection
    </motion.div>
    <motion.div
      className="absolute bottom-6 right-4 px-3 py-1.5 rounded-full text-xs font-sans font-semibold border"
      style={{ background: 'rgba(212,168,83,0.1)', borderColor: '#D4A853', color: '#B8882A' }}
      animate={{ y: [0, 7, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
    >
      ⭐ 4.9 Rated
    </motion.div>
  </div>
);

const MarqueeStrip = ({ items }: { items: string[] }) => {
  const doubled = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-sans text-xs tracking-[0.32em] uppercase font-semibold py-0.5 flex-shrink-0"
            style={{ color: '#D4A853' }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const StatCard = ({ stat, index }: { stat: typeof STATS[0]; index: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-8 text-center border"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(196,96,122,0.1)',
        boxShadow: '0 8px 32px rgba(196,96,122,0.07)',
      }}
    >
      <div className="text-3xl mb-3">{stat.icon}</div>
      <div className="font-display text-4xl mb-2" style={{ color: '#C4607A' }}>
        {inView && <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />}
      </div>
      <div className="font-sans text-xs tracking-widest uppercase" style={{ color: '#9B7080' }}>
        {stat.label}
      </div>
    </motion.div>
  );
};

const TestimonialCard = ({
  testimonial, index,
}: {
  testimonial: typeof TESTIMONIALS[0];
  index: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-8 border"
      style={{
        background: testimonial.color,
        borderColor: 'rgba(196,96,122,0.09)',
        boxShadow: '0 4px 24px rgba(196,96,122,0.06)',
      }}
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={13} className="fill-gold-400 text-gold-400" />
        ))}
      </div>
      <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: '#4A2030' }}>
        "{testimonial.review}"
      </p>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: '#C4607A' }}
        >
          {testimonial.name[0]}
        </div>
        <div>
          <p className="font-sans font-semibold text-sm" style={{ color: '#1A0812' }}>
            {testimonial.name}
          </p>
          <p className="font-sans text-xs" style={{ color: '#9B7080' }}>
            {testimonial.city} · {testimonial.product}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({
  icon: Icon, title, description, color, index,
}: {
  icon: any; title: string; description: string; color: string; index: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="flex flex-col items-center text-center gap-4 p-6 rounded-xl transition-shadow duration-300 hover:shadow-lg cursor-default"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: `${color}1A` }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <h3 className="font-sans font-semibold text-sm mb-1" style={{ color: '#1A0812' }}>{title}</h3>
        <p className="font-sans text-xs" style={{ color: '#9B7080' }}>{description}</p>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({
  eyebrow, title, subtitle,
}: {
  eyebrow: string; title: string; subtitle: string;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="text-center max-w-2xl mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-xs font-sans tracking-[0.4em] uppercase mb-4 font-semibold"
        style={{ color: '#C4607A' }}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="section-title mb-4"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="section-subtitle"
      >
        {subtitle}
      </motion.p>
    </div>
  );
};

const FadeInView = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ───────────────────────── PLACEHOLDER DATA ───────────────────────── */
const PLACEHOLDER_CATEGORIES = Array.from({ length: 8 }, (_, i) => ({
  id: `cat-${i}`,
  name: ['Premium Candles', 'Personalized Gifts', 'Clay Art', 'Home Decor', 'Couple Collections', 'Wedding', 'Festival', 'Corporate'][i],
  slug: `cat-${i}`,
  image: `/categories/cat-${i + 1}.svg`,
}));

const PLACEHOLDER_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: `prod-${i}`,
  title: `ELVA Signature Product ${i + 1}`,
  slug: `product-${i + 1}`,
  price: 699 + i * 200,
  compareAtPrice: 999 + i * 300,
  thumbnail: `/products/prod-${i + 1}.svg`,
  rating: 4.8,
  reviewCount: 12 + i * 5,
}));

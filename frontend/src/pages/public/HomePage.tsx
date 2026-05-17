import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Gift, Star, Truck, RefreshCw, Shield } from 'lucide-react';
import { productsApi, categoriesApi } from '@api/products.api';
import { ProductCard } from '@components/products/ProductCard';
import { CategoryCard } from '@components/categories/CategoryCard';
import { TestimonialCard } from '@components/ui/TestimonialCard';
import { AnimatedCounter } from '@components/ui/AnimatedCounter';

const HERO_WORDS = ['Cherish', 'Celebrate', 'Personalise', 'Gift'];

const FEATURES = [
  { icon: Gift, title: 'Handcrafted with Love', description: 'Every piece made by skilled artisans' },
  { icon: Truck, title: 'Free Shipping ₹999+', description: 'Pan-India delivery in 5–7 days' },
  { icon: RefreshCw, title: 'Easy Returns', description: '7-day hassle-free return policy' },
  { icon: Shield, title: 'Secure Payments', description: 'Razorpay & UPI — 100% secure' },
];

const STATS = [
  { value: 50000, suffix: '+', label: 'Happy Customers' },
  { value: 500, suffix: '+', label: 'Unique Products' },
  { value: 100, suffix: '%', label: 'Handcrafted' },
  { value: 4.9, suffix: '★', label: 'Average Rating', decimals: 1 },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma', city: 'Mumbai', rating: 5,
    review: 'The personalized candle I ordered for my sister\'s wedding was absolutely stunning. The quality exceeded all expectations!',
    product: 'Luxury Personalized Candle',
    avatar: '/avatars/priya.jpg',
  },
  {
    name: 'Arjun Mehta', city: 'Bangalore', rating: 5,
    review: 'ELVA\'s corporate gifting service is unmatched. Our clients were blown away by the premium packaging and quality.',
    product: 'Corporate Gift Hamper',
    avatar: '/avatars/arjun.jpg',
  },
  {
    name: 'Sneha Patel', city: 'Ahmedabad', rating: 5,
    review: 'Ordered clay art as a Diwali gift — received it in beautiful packaging with a personal note. Will definitely order again!',
    product: 'Handcrafted Clay Art',
    avatar: '/avatars/sneha.jpg',
  },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] flex items-center overflow-hidden bg-cream-50">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-cream-100/50 to-cream-50/80 z-10" />
          <img
            src="/hero/hero-bg.jpg"
            alt="ELVA Premium Handcrafted"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
        >
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gold-600 font-sans text-sm tracking-[0.4em] uppercase mb-6"
            >
              India's Finest Handcrafted Brand
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h1 className="font-display text-6xl md:text-8xl text-charcoal-950 leading-none mb-2">
                Made to
              </h1>
              <div className="overflow-hidden h-[1.2em]">
                <AnimatedWords words={HERO_WORDS} />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="font-sans text-charcoal-600 text-lg leading-relaxed mb-10 max-w-lg"
            >
              Every ELVA piece is a labour of love — handcrafted by skilled artisans,
              personalized for your most precious moments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/products" className="btn-primary inline-flex items-center gap-3 group">
                Shop Now
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/gift-finder" className="btn-outline inline-flex items-center gap-3">
                Find the Perfect Gift
                <Gift size={16} />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-0.5 h-12 bg-gradient-to-b from-charcoal-950 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-12 bg-charcoal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-4xl text-gold-400 mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                </div>
                <div className="font-sans text-sm text-charcoal-300 tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
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
            <Link to="/products" className="btn-outline">View All Collections <ArrowRight size={14} className="inline ml-2" /></Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 lg:py-28 bg-cream-50">
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
            <Link to="/products?isFeatured=true" className="btn-primary">Explore All <ArrowRight size={14} className="inline ml-2" /></Link>
          </div>
        </div>
      </section>

      {/* ===== STORYTELLING SECTION ===== */}
      <section className="py-20 lg:py-28 bg-charcoal-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInView>
              <p className="text-gold-400 text-sm tracking-[0.4em] uppercase mb-6">Our Story</p>
              <h2 className="font-display text-5xl text-white leading-tight mb-8">
                Every Gift Tells<br />a Beautiful Story
              </h2>
              <p className="font-sans text-charcoal-300 text-lg leading-relaxed mb-6">
                ELVA was born from a simple belief: the most meaningful gifts are the ones made by hand,
                with love, and personalized for the person you cherish most.
              </p>
              <p className="font-sans text-charcoal-400 leading-relaxed mb-10">
                Our artisans spend countless hours perfecting every detail — from hand-poured candles
                to intricate clay sculptures — ensuring each ELVA piece is worthy of your most precious moments.
              </p>
              <Link to="/about" className="btn-gold inline-flex items-center gap-3">
                Our Story <ArrowRight size={16} />
              </Link>
            </FadeInView>

            <FadeInView delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-charcoal-800 aspect-[3/4] rounded-sm overflow-hidden">
                    <img src="/story/artisan-1.jpg" alt="Artisan" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="bg-gold-900/30 p-6 border border-gold-800/20">
                    <p className="font-display text-gold-400 text-2xl mb-2">50,000+</p>
                    <p className="font-sans text-charcoal-400 text-sm">Gifts Delivered</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-charcoal-800/50 p-6 border border-charcoal-700/20">
                    <p className="font-display text-gold-400 text-2xl mb-2">100%</p>
                    <p className="font-sans text-charcoal-400 text-sm">Handcrafted</p>
                  </div>
                  <div className="bg-charcoal-800 aspect-[3/4] rounded-sm overflow-hidden">
                    <img src="/story/artisan-2.jpg" alt="Craft" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
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
      <section className="py-20 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-luxury text-white p-12 lg:p-16 text-center">
            <p className="text-gold-400 text-sm tracking-[0.4em] uppercase mb-4">Not Sure What to Gift?</p>
            <h2 className="font-display text-5xl text-white mb-6">Use Our Gift Finder</h2>
            <p className="font-sans text-charcoal-300 text-lg mb-10 max-w-xl mx-auto">
              Tell us about the person and occasion — our AI-powered Gift Finder will recommend the perfect ELVA piece.
            </p>
            <Link to="/gift-finder" className="btn-gold inline-flex items-center gap-3 text-base px-10 py-4">
              <Gift size={20} /> Find the Perfect Gift
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 lg:py-28 bg-cream-50">
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

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-16 bg-white border-t border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center gap-4 p-6">
                <div className="w-12 h-12 bg-cream-100 flex items-center justify-center">
                  <Icon size={22} className="text-charcoal-700" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-charcoal-900 text-sm mb-1">{title}</h3>
                  <p className="font-sans text-charcoal-500 text-xs">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-20 bg-charcoal-950 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold-400 text-sm tracking-[0.4em] uppercase mb-4">Join the ELVA Circle</p>
          <h2 className="font-display text-4xl text-white mb-4">Get Exclusive Access</h2>
          <p className="font-sans text-charcoal-400 mb-8">
            Be the first to know about new collections, limited editions, and exclusive offers. Plus, get ₹100 off your first order.
          </p>
          <form className="flex gap-0 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-charcoal-800 border border-charcoal-700 px-5 py-3.5 text-white placeholder-charcoal-500 text-sm focus:outline-none focus:border-gold-500 transition-colors"
            />
            <button type="submit" className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3.5 text-sm font-medium tracking-wide uppercase transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
          <p className="text-charcoal-600 text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}

// ===== Helper Components =====

const AnimatedWords = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(timer);
  }, [words.length]);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="block font-display text-6xl md:text-8xl text-gold-500 leading-none"
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};

const SectionHeader = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="text-center max-w-2xl mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-gold-600 text-sm tracking-[0.4em] uppercase mb-4 font-sans"
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
        initial={{ opacity: 0, y: 16 }}
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
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// Placeholder data while API loads
const PLACEHOLDER_CATEGORIES = Array.from({ length: 8 }, (_, i) => ({
  id: `cat-${i}`,
  name: ['Premium Candles', 'Personalized Gifts', 'Clay Art', 'Home Decor', 'Couple Collections', 'Wedding', 'Festival', 'Corporate'][i],
  slug: `cat-${i}`,
  image: `/categories/cat-${i + 1}.jpg`,
}));

const PLACEHOLDER_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: `prod-${i}`,
  title: `ELVA Signature Product ${i + 1}`,
  slug: `product-${i + 1}`,
  price: 699 + i * 200,
  compareAtPrice: 999 + i * 300,
  thumbnail: `/products/prod-${i + 1}.jpg`,
  rating: 4.8,
  reviewCount: 12 + i * 5,
}));


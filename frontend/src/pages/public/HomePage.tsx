import { useRef, useEffect, useState } from 'react';
import {
  motion, useScroll, useTransform, useInView, AnimatePresence,
} from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Gift, Star, Truck, RefreshCw, Shield } from 'lucide-react';
import { productsApi, categoriesApi } from '@api/products.api';
import { ProductCard } from '@components/products/ProductCard';
import { CategoryCard } from '@components/categories/CategoryCard';

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

const CAROUSEL_SLIDES = [
  {
    title: 'Premium Candles', desc: 'Hand-poured soy & beeswax — every flame tells a story',
    stat: '50,000+', statLabel: 'Happy Customers', emoji: '🕯️', href: '/category/premium-candles',
    bg: 'linear-gradient(150deg,#3D0820 0%,#8B2D4E 60%,#C4607A 100%)', accent: '#F9C0D0',
    image: '/categories/cat-1.svg',
    floats: [
      { img: '/products/prod-1.svg', top: '12%', right: '8%',  rotate: 8,  delay: 0.35 },
      { img: '/products/prod-2.svg', top: '38%', right: '14%', rotate: -5, delay: 0.45 },
      { img: '/products/prod-3.svg', top: '62%', right: '5%',  rotate: 10, delay: 0.55 },
    ],
  },
  {
    title: 'Clay Art', desc: 'Sculpted by hand, fired with love, gifted with intention',
    stat: '500+', statLabel: 'Unique Designs', emoji: '🏺', href: '/category/clay-art',
    bg: 'linear-gradient(150deg,#2A1210 0%,#7A3820 60%,#C4723A 100%)', accent: '#F9C090',
    image: '/categories/cat-3.svg',
    floats: [
      { img: '/products/prod-4.svg', top: '10%', right: '10%', rotate: -7, delay: 0.35 },
      { img: '/products/prod-5.svg', top: '42%', right: '6%',  rotate: 9,  delay: 0.48 },
      { img: '/products/prod-1.svg', top: '65%', right: '13%', rotate: -4, delay: 0.58 },
    ],
  },
  {
    title: 'Luxury Hampers', desc: 'Curated for your most unforgettable occasions',
    stat: '100%', statLabel: 'Handcrafted', emoji: '🧺', href: '/category/luxury-hampers',
    bg: 'linear-gradient(150deg,#0A1A10 0%,#1A5030 60%,#3A8050 100%)', accent: '#90F4C0',
    image: '/categories/cat-4.svg',
    floats: [
      { img: '/products/prod-6.svg', top: '8%',  right: '7%',  rotate: 6,  delay: 0.33 },
      { img: '/products/prod-7.svg', top: '40%', right: '12%', rotate: -8, delay: 0.44 },
      { img: '/products/prod-2.svg', top: '66%', right: '4%',  rotate: 4,  delay: 0.54 },
    ],
  },
  {
    title: 'Personalized Gifts', desc: 'Your name, your story — made just for them',
    stat: '4.9★', statLabel: 'Average Rating', emoji: '🎁', href: '/category/personalized-gifts',
    bg: 'linear-gradient(150deg,#180830 0%,#481878 60%,#7840C0 100%)', accent: '#C8A8FF',
    image: '/categories/cat-2.svg',
    floats: [
      { img: '/products/prod-8.svg', top: '10%', right: '9%',  rotate: -6, delay: 0.36 },
      { img: '/products/prod-3.svg', top: '44%', right: '5%',  rotate: 11, delay: 0.46 },
      { img: '/products/prod-5.svg', top: '68%', right: '14%', rotate: -3, delay: 0.56 },
    ],
  },
  {
    title: 'Wedding Collections', desc: 'Gifts as eternal as the vows they celebrate',
    stat: '10,000+', statLabel: 'Weddings Gifted', emoji: '💍', href: '/category/wedding-collections',
    bg: 'linear-gradient(150deg,#201008 0%,#5A3808 60%,#9A6818 100%)', accent: '#F4D890',
    image: '/categories/cat-5.svg',
    floats: [
      { img: '/products/prod-4.svg', top: '9%',  right: '11%', rotate: 7,  delay: 0.34 },
      { img: '/products/prod-6.svg', top: '41%', right: '7%',  rotate: -9, delay: 0.44 },
      { img: '/products/prod-8.svg', top: '64%', right: '3%',  rotate: 5,  delay: 0.54 },
    ],
  },
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
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">

        {/* ── Mobile hero: full-bleed atmospheric ── */}
        <div className="lg:hidden absolute inset-0">
          {/* Rich gradient base */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#FDF0F5 0%,#F8E8F0 30%,#EFE0F8 65%,#FDF6EC 100%)' }} />
          {/* Subtle background artwork */}
          <img src="/hero/hero-bg.svg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none select-none" />
          {/* Floating orbs on mobile */}
          <div className="absolute top-[-10%] right-[-15%] w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(196,96,122,0.28) 0%,transparent 70%)' }} />
          <div className="absolute bottom-[10%] left-[-10%] w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(212,168,83,0.18) 0%,transparent 70%)' }} />
          {/* Floating product cards — decorative */}
          {HERO_CARDS.slice(0, 3).map((card, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.7, rotate: card.rotate * 0.5 }}
              animate={{ opacity: 1, scale: 1, rotate: card.rotate, y: [0, i % 2 === 0 ? -8 : 6, 0] }}
              transition={{
                opacity: { delay: card.delay, duration: 0.7 },
                scale:   { delay: card.delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                y:       { delay: card.delay + 0.6, duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' },
              }}
              className="absolute rounded-2xl p-3.5 border pointer-events-none"
              style={{
                top:  i === 0 ? '14%' : i === 1 ? '36%' : '58%',
                right: i === 0 ? '5%' : i === 1 ? '18%' : '4%',
                width: i === 1 ? 92 : 80,
                background: card.bg,
                borderColor: 'rgba(196,96,122,0.18)',
                boxShadow: '0 16px 40px rgba(196,96,122,0.16)',
              }}
            >
              <div className="aspect-square rounded-xl mb-2 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.75)', fontSize: i === 1 ? 28 : 22 }}>
                {card.emoji}
              </div>
              <p className="font-sans text-[8px] font-bold truncate" style={{ color: '#1A0812' }}>{card.label}</p>
              <p className="font-display text-sm" style={{ color: '#C4607A' }}>{card.price}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Desktop hero background ── */}
        <div className="hidden lg:block absolute inset-0"
          style={{ background: 'linear-gradient(140deg, #1A0810 0%, #2E1228 38%, #1E0820 65%, #150610 100%)' }}>
          {/* Soft rose bloom — top right */}
          <div className="absolute top-[-12%] right-[-8%] w-[700px] h-[700px] rounded-full blur-[130px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,45,78,0.38) 0%, transparent 60%)' }} />
          {/* Gold warmth — bottom left */}
          <div className="absolute bottom-[-8%] left-[-6%] w-[520px] h-[520px] rounded-full blur-[110px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.18) 0%, transparent 60%)' }} />
          {/* Deep center glow */}
          <div className="absolute top-[45%] left-[40%] w-[440px] h-[440px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(196,96,122,0.13) 0%, transparent 60%)' }} />
          {/* Horizontal grain lines — architectural feel */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 80px)' }} />
          {/* Gold corner accent */}
          <div className="absolute top-0 right-0 w-px h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(212,168,83,0.55), transparent)' }} />
          <div className="absolute top-0 right-0 h-px w-40 pointer-events-none"
            style={{ background: 'linear-gradient(to left, rgba(212,168,83,0.55), transparent)' }} />
        </div>

        {/* ── Content ── */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">

          {/* Mobile layout: centered, bottom-half text over the visual */}
          <div className="lg:hidden flex flex-col justify-end min-h-screen pb-10 pt-[72px]">
            <div className="text-center">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}
                className="inline-flex items-center gap-2.5 mb-5">
                <div className="h-px w-7" style={{ background: '#C4607A' }} />
                <span className="text-[9px] font-sans tracking-[0.36em] uppercase font-semibold" style={{ color: '#C4607A' }}>India's Finest Handcrafted Brand</span>
                <div className="h-px w-7" style={{ background: '#C4607A' }} />
              </motion.div>

              <div className="overflow-hidden">
                <motion.h1 initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.32, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display leading-none"
                  style={{ fontSize: 'clamp(54px, 14vw, 76px)', color: '#1A0812', letterSpacing: '-0.02em' }}>
                  Made to
                </motion.h1>
              </div>
              <div className="overflow-hidden" style={{ height: 'clamp(54px, 14vw, 76px)' }}>
                <AnimatedWords words={HERO_WORDS} size="clamp(54px, 14vw, 76px)" />
              </div>

              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="font-sans text-[14px] leading-relaxed mt-5 mb-7 mx-auto max-w-[280px]"
                style={{ color: '#6B3A4E' }}>
                Handcrafted by skilled artisans, personalized for your most precious moments.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.68, duration: 0.6 }}
                className="flex flex-col gap-3 mx-auto max-w-xs">
                <Link to="/products"
                  className="inline-flex items-center justify-center gap-2.5 py-4 text-[12px] font-bold tracking-[0.22em] uppercase font-sans"
                  style={{ background: '#1A0812', color: '#FDF6EE' }}>
                  Explore Collection <ArrowRight size={13} />
                </Link>
                <Link to="/gift-finder"
                  className="inline-flex items-center justify-center gap-2.5 py-3.5 text-[12px] font-bold tracking-[0.22em] uppercase font-sans border"
                  style={{ borderColor: '#C4607A', color: '#C4607A' }}>
                  <Gift size={13} /> Find Perfect Gift
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}
                className="flex items-center justify-center gap-8 mt-8 pt-6 border-t mx-8"
                style={{ borderColor: '#EAD0DA' }}>
                {[{ n: '50K+', l: 'Customers' }, { n: '4.9★', l: 'Rating' }, { n: '500+', l: 'Products' }].map(item => (
                  <div key={item.l}>
                    <div className="font-display text-xl" style={{ color: '#C4607A' }}>{item.n}</div>
                    <div className="font-sans text-[9px] tracking-wide uppercase mt-0.5" style={{ color: '#9B7080' }}>{item.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Desktop layout: dark cinematic 2-col */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-center py-32">
            <div>
              <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3 mb-8">
                <div className="h-px w-10" style={{ background: 'rgba(212,168,83,0.6)' }} />
                <span className="text-[10px] font-sans tracking-[0.42em] uppercase font-semibold" style={{ color: 'rgba(212,168,83,0.8)' }}>India's Finest Handcrafted Brand</span>
                <div className="h-px w-10" style={{ background: 'rgba(212,168,83,0.6)' }} />
              </motion.div>

              <div className="overflow-hidden mb-1">
                <motion.h1 initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display leading-none"
                  style={{ fontSize: 'clamp(60px, 7.5vw, 108px)', color: 'white', letterSpacing: '-0.02em' }}>
                  Made to
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-8" style={{ height: 'clamp(60px, 7.5vw, 108px)' }}>
                <AnimatedWords words={HERO_WORDS} size="clamp(60px, 7.5vw, 108px)" color="#D4A853" />
              </div>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.7 }}
                className="font-sans text-lg leading-relaxed mb-10 max-w-lg" style={{ color: 'rgba(255,255,255,0.52)' }}>
                Every ELVA piece is a labour of love — handcrafted by skilled artisans, personalized for your most precious moments.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="flex flex-row gap-4">
                <Link to="/products"
                  className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-widest uppercase font-sans transition-all duration-300"
                  style={{ background: '#D4A853', color: '#08020F' }}>
                  Explore Collection <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <Link to="/gift-finder"
                  className="group inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-widest uppercase font-sans border transition-all duration-300"
                  style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.72)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)')}>
                  <Gift size={15} /> Find Perfect Gift
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.95, duration: 0.7 }}
                className="flex items-center gap-8 mt-12 pt-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                {[{ n: '50K+', l: 'Customers' }, { n: '4.9★', l: 'Avg Rating' }, { n: '500+', l: 'Products' }].map(item => (
                  <div key={item.l}>
                    <div className="font-display text-2xl" style={{ color: '#D4A853' }}>{item.n}</div>
                    <div className="font-sans text-[10px] tracking-[0.28em] uppercase mt-1" style={{ color: 'rgba(255,255,255,0.32)' }}>{item.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.38, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
              <ProductGallery />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue — desktop only */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2">
          <span className="font-sans text-[10px] tracking-[0.35em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>Scroll</span>
          <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom,rgba(212,168,83,0.5),transparent)' }} />
        </motion.div>
      </section>

      {/* ===== MARQUEE — desktop only (mobile already has navbar announcement) ===== */}
      <div className="hidden sm:block py-4 overflow-hidden" style={{ background: '#1E0812' }}>
        <MarqueeStrip items={MARQUEE_ITEMS} />
      </div>

      {/* ===== VISUAL CAROUSEL ===== */}
      <VisualCarousel />

      {/* ===== CATEGORIES ===== */}
      <section className="py-14 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Collections"
            title="Shop by Category"
            subtitle="From personalized gifts to luxury hampers — discover what makes your moments unforgettable."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
            {(categories || PLACEHOLDER_CATEGORIES).slice(0, 8).map((cat: any, i: number) => (
              <CategoryCard key={cat.id || i} category={cat} index={i} />
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-10">
            <Link to="/products" className="btn-outline">
              View All Collections <ArrowRight size={13} className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section
        className="py-14 lg:py-28"
        style={{ background: 'linear-gradient(160deg, #FDF6EE 0%, #FFF5F7 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Curated for You"
            title="Featured Products"
            subtitle="Our most-loved, handpicked products — crafted for those who appreciate the finest things."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-8 sm:mt-12">
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
        className="py-14 lg:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 55%, #1A0820 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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
      <section className="py-14 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Just In"
            title="New Arrivals"
            subtitle="Fresh from our artisans' hands — be the first to own something truly special."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-8 sm:mt-12">
            {(newArrivals || PLACEHOLDER_PRODUCTS).slice(0, 4).map((product: any, i: number) => (
              <ProductCard key={product.id || i} product={product} index={i} showNewBadge />
            ))}
          </div>
        </div>
      </section>

      {/* ===== GIFT FINDER BANNER ===== */}
      <section
        className="py-14 sm:py-20 overflow-hidden relative"
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
        className="py-14 lg:py-28"
        style={{ background: 'linear-gradient(135deg, #FFF8F2 0%, #FFF0F5 50%, #F8F5FF 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Customer Love"
            title="What Our Customers Say"
            subtitle="Real stories from real people — because every gift has a story worth sharing."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-10 sm:py-16 bg-white border-t border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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
              className="flex flex-col sm:flex-row max-w-md mx-auto gap-3 sm:gap-0"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 text-sm focus:outline-none font-sans rounded sm:rounded-none"
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

const AnimatedWords = ({ words, size = 'clamp(60px, 7.5vw, 108px)', color = '#C4607A' }: { words: string[]; size?: string; color?: string }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ y: 80, opacity: 0, skewY: 4 }}
        animate={{ y: 0, opacity: 1, skewY: 0 }}
        exit={{ y: -80, opacity: 0, skewY: -4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="block font-display leading-none"
        style={{ fontSize: size, color, letterSpacing: '-0.02em' }}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};


const ProductGallery = () => (
  <div className="relative h-[600px] w-full select-none">

    {/* Ghost ELVA text — background architectural element */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <span
        className="font-display font-bold leading-none"
        style={{
          fontSize: 'clamp(140px, 18vw, 220px)',
          color: 'transparent',
          WebkitTextStroke: '1px rgba(212,168,83,0.07)',
          letterSpacing: '-0.04em',
          userSelect: 'none',
        }}
      >
        ELVA
      </span>
    </div>

    {/* Ambient glow center */}
    <div className="absolute top-[38%] left-[42%] -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[80px] pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(139,45,78,0.22) 0%, transparent 70%)' }} />

    {/* Vertical gold line — right edge */}
    <div className="absolute top-12 right-12 w-px h-32 pointer-events-none"
      style={{ background: 'linear-gradient(to bottom, rgba(212,168,83,0.45), transparent)' }} />
    <div className="absolute top-12 right-12 h-px w-16 pointer-events-none"
      style={{ background: 'linear-gradient(to right, rgba(212,168,83,0.45), transparent)' }} />

    {/* Frame 1 — Main large (cat-1) */}
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: -4 }}
      animate={{ opacity: 1, y: 0, rotate: -4 }}
      transition={{ delay: 0.4, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="absolute overflow-hidden"
      style={{ top: '4%', left: '6%', width: 248, height: 326, borderRadius: 3, border: '1px solid rgba(212,168,83,0.18)', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}
    >
      <img src="/categories/cat-1.svg" alt="" draggable={false}
        className="w-full h-full object-cover pointer-events-none"
        style={{ filter: 'saturate(1.15) brightness(0.78)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,2,15,0.82) 0%, rgba(8,2,15,0.1) 50%, transparent 100%)' }} />
      <div className="absolute bottom-5 left-5">
        <p className="font-sans text-[8px] tracking-[0.45em] uppercase mb-1" style={{ color: 'rgba(212,168,83,0.65)' }}>Handcrafted</p>
        <p className="font-display text-lg leading-none" style={{ color: 'white' }}>Premium Candles</p>
      </div>
    </motion.div>

    {/* Frame 2 — Secondary (cat-3) */}
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 5 }}
      animate={{ opacity: 1, y: 0, rotate: 5 }}
      transition={{ delay: 0.58, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="absolute overflow-hidden"
      style={{ top: '28%', right: '4%', width: 196, height: 258, borderRadius: 3, border: '1px solid rgba(196,96,122,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)' }}
    >
      <img src="/categories/cat-3.svg" alt="" draggable={false}
        className="w-full h-full object-cover pointer-events-none"
        style={{ filter: 'saturate(1.1) brightness(0.75)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,2,15,0.85) 0%, transparent 55%)' }} />
      <div className="absolute bottom-4 left-4">
        <p className="font-sans text-[8px] tracking-[0.4em] uppercase mb-1" style={{ color: 'rgba(212,168,83,0.6)' }}>Artisan Made</p>
        <p className="font-display text-base leading-none" style={{ color: 'white' }}>Clay Art</p>
      </div>
    </motion.div>

    {/* Frame 3 — Accent square (cat-5) */}
    <motion.div
      initial={{ opacity: 0, y: 35, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 2 }}
      transition={{ delay: 0.74, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="absolute overflow-hidden"
      style={{ bottom: '6%', left: '28%', width: 172, height: 172, borderRadius: 3, border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 20px 56px rgba(0,0,0,0.5)' }}
    >
      <img src="/categories/cat-5.svg" alt="" draggable={false}
        className="w-full h-full object-cover pointer-events-none"
        style={{ filter: 'saturate(1.0) brightness(0.72)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,2,15,0.88) 0%, transparent 55%)' }} />
      <div className="absolute bottom-3 left-4">
        <p className="font-display text-sm leading-none" style={{ color: 'white' }}>Wedding</p>
      </div>
    </motion.div>

    {/* Floating tag — "New Collection" */}
    <motion.div
      className="absolute font-sans text-[10px] font-semibold tracking-[0.32em] uppercase"
      style={{ top: '10%', right: '7%', border: '1px solid rgba(212,168,83,0.32)', color: '#D4A853', background: 'rgba(8,2,15,0.82)', padding: '6px 14px', borderRadius: 2, backdropFilter: 'blur(8px)' }}
      animate={{ y: [0, -9, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      New Collection
    </motion.div>

    {/* Floating stat card */}
    <motion.div
      className="absolute"
      style={{ bottom: '20%', right: '6%', background: 'rgba(8,2,15,0.88)', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 18px', borderRadius: 2, backdropFilter: 'blur(12px)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
    >
      <p className="font-display text-3xl leading-none" style={{ color: '#D4A853' }}>4.9</p>
      <p className="font-sans text-[8px] tracking-[0.36em] uppercase mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Star Rated</p>
    </motion.div>

    {/* Bottom horizontal gold line */}
    <div className="absolute bottom-16 left-6 w-20 h-px pointer-events-none"
      style={{ background: 'linear-gradient(to right, rgba(212,168,83,0.4), transparent)' }} />
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

const N_SLIDES = CAROUSEL_SLIDES.length;
const THUMB_W = 72;
const GAP = 10;

const VisualCarousel = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (paused || !inView) return;
    const t = setInterval(() => setActive(a => (a + 1) % N_SLIDES), 4500);
    return () => clearInterval(t);
  }, [paused, inView]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ background: '#080208' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="w-full h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(212,168,83,0.28) 30%,rgba(212,168,83,0.28) 70%,transparent)' }} />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-5 flex items-center justify-between">
        <p className="font-sans text-[10px] tracking-[0.48em] uppercase font-semibold" style={{ color: 'rgba(212,168,83,0.5)' }}>Our Collections</p>
        <div className="flex items-center gap-2">
          {CAROUSEL_SLIDES.map((_, i) => (
            <motion.button key={i} onClick={() => setActive(i)}
              animate={{ width: i === active ? 28 : 6, opacity: i === active ? 1 : 0.28 }}
              transition={{ duration: 0.35 }}
              className="h-[2px] rounded-full" style={{ background: '#D4A853' }} />
          ))}
        </div>
      </div>

      {/* ── Desktop: expanding accordion ── */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10"
        style={{ gap: GAP, height: 520 }}>
        {CAROUSEL_SLIDES.map((s, i) => {
          const isActive = i === active;
          const activeW = `calc(100% - ${(N_SLIDES - 1) * (THUMB_W + GAP)}px)`;
          return (
            <motion.div key={i}
              animate={{ width: isActive ? activeW : THUMB_W }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setActive(i)}
              className="relative flex-shrink-0 overflow-hidden cursor-pointer"
              style={{ borderRadius: 20, height: '100%' }}
            >
              {/* ── Base illustration (always visible, zoom & filter driven by active) ── */}
              <motion.img
                src={s.image} alt={s.title} draggable={false}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                animate={{ scale: isActive ? 1.0 : 1.14, filter: isActive ? 'saturate(1.2) brightness(0.72)' : 'saturate(0.3) brightness(0.28)' }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Gradient vignette */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(160deg,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.0) 30%,rgba(0,0,0,0.72) 70%,rgba(0,0,0,0.96) 100%)' }} />

              {/* Accent screen tint */}
              <motion.div className="absolute inset-0 pointer-events-none"
                animate={{ opacity: isActive ? 0.14 : 0 }} transition={{ duration: 0.7 }}
                style={{ background: `radial-gradient(ellipse at 30% 20%, ${s.accent} 0%, transparent 60%)`, mixBlendMode: 'screen' }} />

              {/* ── Inactive: vertical title only ── */}
              <motion.div className="absolute inset-0 flex items-center justify-center select-none"
                animate={{ opacity: isActive ? 0 : 1 }} transition={{ duration: 0.2 }}>
                <p className="font-sans text-[9px] font-bold tracking-[0.4em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.4)', writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
                  {s.title}
                </p>
              </motion.div>

              {/* ── Active: split layout ── */}
              <motion.div className="absolute inset-0 p-7 flex flex-col justify-between"
                animate={{ opacity: isActive ? 1 : 0 }} transition={{ duration: 0.35, delay: isActive ? 0.22 : 0 }}>

                {/* Top row: emoji + floating product thumbnails */}
                <div className="flex items-start justify-between">
                  {/* Emoji with glow */}
                  <div className="relative">
                    <motion.div className="absolute -inset-5 rounded-full blur-2xl pointer-events-none"
                      animate={{ opacity: isActive ? 0.5 : 0, scale: isActive ? 1 : 0.4 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      style={{ background: s.accent }} />
                    <motion.span className="relative text-[68px] leading-none block select-none"
                      animate={{ scale: isActive ? 1 : 0.4, opacity: isActive ? 1 : 0 }}
                      transition={{ delay: 0.25, type: 'spring', stiffness: 220, damping: 16 }}
                      style={{ filter: `drop-shadow(0 4px 24px ${s.accent}99)` }}>
                      {s.emoji}
                    </motion.span>
                  </div>

                  {/* Floating product thumbnails — right side */}
                  <div className="flex flex-col gap-2.5 items-end">
                    {s.floats.map((f, fi) => (
                      <motion.div key={fi}
                        animate={{
                          opacity: isActive ? 1 : 0,
                          y: isActive ? [0, -6, 0] : 0,
                          rotate: f.rotate,
                          scale: isActive ? 1 : 0.7,
                        }}
                        transition={{
                          opacity: { delay: f.delay, duration: 0.4 },
                          scale:   { delay: f.delay, duration: 0.4, type: 'spring' },
                          y:       { delay: f.delay + 0.5, duration: 2.8 + fi * 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' },
                        }}
                        className="select-none pointer-events-none"
                        style={{ width: 76 }}
                      >
                        <div style={{
                          borderRadius: 14, overflow: 'hidden',
                          border: `1px solid ${s.accent}33`,
                          boxShadow: `0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)`,
                          backdropFilter: 'blur(4px)',
                        }}>
                          <img src={f.img} alt="" className="w-full aspect-square object-cover"
                            style={{ filter: 'brightness(0.85) saturate(1.15)' }} />
                        </div>
                        {/* Price tag */}
                        <div className="mt-1.5 mx-1 px-2 py-0.5 rounded-full text-center"
                          style={{ background: 'rgba(0,0,0,0.55)', border: `1px solid ${s.accent}44`, backdropFilter: 'blur(8px)' }}>
                          <span className="font-sans text-[9px] font-semibold tracking-wide" style={{ color: s.accent }}>
                            ₹{(899 + fi * 400).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bottom: text block */}
                <div>
                  {/* Thin gold accent bar */}
                  <motion.div className="h-[2px] rounded-full mb-4"
                    animate={{ width: isActive ? 40 : 0 }} transition={{ delay: 0.38, duration: 0.4 }}
                    style={{ background: `linear-gradient(to right, ${s.accent}, transparent)` }} />

                  <motion.p className="font-display text-[28px] text-white leading-tight mb-1.5"
                    animate={{ y: isActive ? 0 : 16, opacity: isActive ? 1 : 0 }}
                    transition={{ delay: 0.32, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    {s.title}
                  </motion.p>

                  <motion.p className="text-[12.5px] font-sans mb-6 leading-relaxed"
                    animate={{ y: isActive ? 0 : 12, opacity: isActive ? 1 : 0 }}
                    transition={{ delay: 0.38, duration: 0.45 }}
                    style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 280 }}>
                    {s.desc}
                  </motion.p>

                  <motion.div className="flex items-center justify-between"
                    animate={{ y: isActive ? 0 : 10, opacity: isActive ? 1 : 0 }}
                    transition={{ delay: 0.44, duration: 0.4 }}>
                    <div>
                      <p className="font-display text-[38px] leading-none"
                        style={{ color: s.accent, textShadow: `0 0 40px ${s.accent}55` }}>
                        {s.stat}
                      </p>
                      <p className="font-sans text-[9px] tracking-[0.4em] uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        {s.statLabel}
                      </p>
                    </div>
                    <Link to={s.href} onClick={e => e.stopPropagation()}
                      className="group flex items-center gap-2 font-sans text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-3 rounded-full transition-all duration-200 hover:scale-105"
                      style={{ background: s.accent, color: '#0C0408', boxShadow: `0 4px 20px ${s.accent}55` }}>
                      Explore
                      <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Mobile ── */}
      <div className="lg:hidden px-4 pb-8">
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 420 }}>
          <AnimatePresence mode="wait">
            <motion.div key={active} className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: CAROUSEL_SLIDES[active].bg }}>
              {(() => {
                const s = CAROUSEL_SLIDES[active];
                return (
                  <>
                    <img src={s.image} alt={s.title} draggable={false}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      style={{ filter: 'saturate(1.15) brightness(0.68)' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.2) 58%,transparent 100%)' }} />
                    <div className="absolute inset-0" style={{ background: s.accent, opacity: 0.1, mixBlendMode: 'screen' as any }} />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      {/* Top: emoji + product thumbnails */}
                      <div className="flex items-start justify-between">
                        <div className="relative">
                          <div className="absolute -inset-3 rounded-full blur-xl opacity-45 pointer-events-none" style={{ background: s.accent }} />
                          <span className="relative text-[58px] leading-none block select-none" style={{ filter: `drop-shadow(0 0 18px ${s.accent}aa)` }}>{s.emoji}</span>
                        </div>
                        <div className="flex gap-2.5 mt-1">
                          {s.floats.slice(0, 2).map((f, fi) => (
                            <div key={fi} className="flex flex-col items-center gap-1">
                              <div style={{ width: 62, borderRadius: 12, overflow: 'hidden', border: `1px solid ${s.accent}40`, boxShadow: `0 6px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)` }}>
                                <img src={f.img} alt="" className="w-full aspect-square object-cover" style={{ filter: 'brightness(0.88) saturate(1.1)' }} />
                              </div>
                              <div className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${s.accent}33` }}>
                                <span className="font-sans text-[8px] font-semibold" style={{ color: s.accent }}>₹{(899 + fi * 400).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Bottom content */}
                      <div>
                        <div className="h-[2px] rounded-full mb-3" style={{ width: 32, background: s.accent }} />
                        <p className="font-display text-[26px] text-white leading-tight mb-1.5">{s.title}</p>
                        <p className="text-[12px] font-sans mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>{s.desc}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-display text-[30px] leading-none" style={{ color: s.accent, textShadow: `0 0 24px ${s.accent}55` }}>{s.stat}</p>
                            <p className="font-sans text-[9px] tracking-[0.38em] uppercase mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.statLabel}</p>
                          </div>
                          <Link to={s.href}
                            className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-[0.18em] uppercase px-4 py-2.5 rounded-full"
                            style={{ background: s.accent, color: '#080208', boxShadow: `0 4px 16px ${s.accent}55` }}>
                            Explore <ArrowRight size={9} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => setActive(a => (a - 1 + N_SLIDES) % N_SLIDES)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 transition-colors hover:text-white/70"
            style={{ background: 'rgba(255,255,255,0.06)' }}>←</button>
          <div className="flex gap-2">
            {CAROUSEL_SLIDES.map((_, i) => (
              <motion.div key={i} onClick={() => setActive(i)}
                animate={{ width: i === active ? 22 : 6, opacity: i === active ? 1 : 0.28 }}
                className="h-[2px] rounded-full cursor-pointer" style={{ background: '#D4A853' }} />
            ))}
          </div>
          <button onClick={() => setActive(a => (a + 1) % N_SLIDES)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 transition-colors hover:text-white/70"
            style={{ background: 'rgba(255,255,255,0.06)' }}>→</button>
        </div>
      </div>

      <div className="w-full h-px" style={{ background: 'linear-gradient(to right,transparent,rgba(212,168,83,0.28) 30%,rgba(212,168,83,0.28) 70%,transparent)' }} />
    </section>
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
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} className="text-center max-w-2xl mx-auto px-2">
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-[10px] font-sans tracking-[0.38em] uppercase mb-3 sm:mb-4 font-semibold"
        style={{ color: '#C4607A' }}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display leading-tight mb-3 sm:mb-4"
        style={{ fontSize: 'clamp(26px, 5vw, 48px)', color: '#1A0812' }}
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-sans text-sm sm:text-base leading-relaxed"
        style={{ color: '#9B7080' }}
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

import { useRef, useEffect, useState } from 'react';
import {
  motion, useScroll, useTransform, useInView, AnimatePresence,
} from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Gift, Star, Truck, RefreshCw, Shield, Sparkles, ShoppingBag } from 'lucide-react';
import { productsApi, categoriesApi } from '@api/products.api';
import { ProductCard } from '@components/products/ProductCard';
import { CategoryCard } from '@components/categories/CategoryCard';
import { InstagramReels } from '@components/home/InstagramReels';
import { SEOHead } from '@components/seo/SEOHead';

const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://www.elunoracrafts.com/#webpage',
  'url': 'https://www.elunoracrafts.com/',
  'name': 'ELUNORA — Premium Handcrafted Gifts & Lifestyle',
  'description': "India's finest premium handcrafted gifting brand. Personalized gifts, luxury candles, clay art & curated hampers crafted with love.",
  'isPartOf': { '@id': 'https://www.elunoracrafts.com/#website' },
  'about': { '@id': 'https://www.elunoracrafts.com/#organization' },
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [{ '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' }],
  },
};

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
    bg: '#1A0B12', accent: '#D4A853',
    image: '/categories/cat_candles_1779782736599.png',
  },
  {
    title: 'Clay Art', desc: 'Sculpted by hand, fired with love, gifted with intention',
    stat: '500+', statLabel: 'Unique Designs', emoji: '🏺', href: '/category/clay-art',
    bg: '#1A100B', accent: '#F9C090',
    image: '/categories/cat_clay_1779782751534.png',
  },
  {
    title: 'Luxury Hampers', desc: 'Curated for your most unforgettable occasions',
    stat: '100%', statLabel: 'Handcrafted', emoji: '🧺', href: '/category/luxury-hampers',
    bg: '#0A1A10', accent: '#90F4C0',
    image: '/categories/cat_hampers_1779782767460.png',
  },
  {
    title: 'Personalized Gifts', desc: 'Your name, your story — made just for them',
    stat: '4.9★', statLabel: 'Average Rating', emoji: '🎁', href: '/category/personalized-gifts',
    bg: '#180B22', accent: '#C8A8FF',
    image: '/categories/cat_personalized_1779782786385.png',
  },
  {
    title: 'Wedding Collections', desc: 'Gifts as eternal as the vows they celebrate',
    stat: '10,000+', statLabel: 'Weddings Gifted', emoji: '💍', href: '/category/wedding-collections',
    bg: '#22160A', accent: '#F4D890',
    image: '/categories/cat_wedding_1779782802829.png',
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
    review: "ELUNORA's corporate gifting service is unmatched. Our clients were blown away by the premium packaging and quality.",
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
    <>
      <SEOHead
        title="ELUNORA — Premium Handcrafted Gifts & Lifestyle | India"
        description="India's finest premium handcrafted gifting brand. Discover personalized gifts, luxury candles, clay art & curated hampers crafted with love by skilled artisans. Free shipping ₹999+."
        keywords="handcrafted gifts India, premium gifting, personalized gifts, luxury hampers, clay art, handmade candles, corporate gifting India, artisan gifts, ELUNORA"
        schema={HOME_SCHEMA}
      />
    <div className="overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">

        {/* ── Immersive Background ── */}
        <div className="absolute inset-0">
          <img src="/hero/hero-3d.png" alt="Luxury Gifts" className="absolute inset-0 w-full h-full object-cover object-[75%_center]" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080208 0%, transparent 60%)' }} />
          <div className="absolute inset-0 hidden sm:block" style={{ background: 'linear-gradient(to right, rgba(8,2,8,0.9) 0%, transparent 70%)' }} />
          <div className="absolute inset-0 sm:hidden" style={{ background: 'linear-gradient(to right, rgba(8,2,8,0.85) 0%, rgba(8,2,8,0.6) 100%)' }} />
        </div>

        {/* ── Content ── */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center pt-28 sm:pt-32 pb-16">
          
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 mb-8 px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <Star size={14} className="text-gold-400" fill="#D4A853" />
              <span className="text-[11px] sm:text-xs font-sans tracking-[0.3em] uppercase text-white/90 font-semibold">India's Finest Handcrafted Brand</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-white leading-[1.2] mb-8 flex flex-wrap items-center sm:items-baseline gap-x-3 sm:gap-x-5"
              style={{ fontSize: 'clamp(56px, 10vw, 96px)', letterSpacing: '-0.02em' }}>
              <span>Made to</span>
              <span className="overflow-hidden relative inline-flex items-center" style={{ height: '1.2em' }}>
                <span className="opacity-0 pointer-events-none select-none" style={{ visibility: 'hidden' }}>Personalise</span>
                <AnimatedWords words={HERO_WORDS} size="clamp(56px, 10vw, 96px)" color="#D4A853" />
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
              className="font-sans text-base sm:text-xl leading-relaxed text-white/70 max-w-lg mb-12">
              Every ELUNORA piece is a labour of love — crafted by skilled artisans, personalized for your most precious moments, and delivered with unparalleled luxury.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <Link to="/products"
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-5 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105"
                style={{ background: '#D4A853', color: '#080208', boxShadow: '0 10px 30px rgba(212,168,83,0.3)' }}>
                Explore Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/gift-finder"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-5 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 border border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white/10 hover:border-white/40">
                <Gift size={16} /> Find Perfect Gift
              </Link>
            </motion.div>


          </div>
        </motion.div>


      </section>


      {/* ===== MARQUEE — desktop only (mobile already has navbar announcement) ===== */}
      <div className="hidden sm:block py-4 overflow-hidden" style={{ background: '#100610' }}>
        <MarqueeStrip items={MARQUEE_ITEMS} />
      </div>

      {/* ===== VISUAL CAROUSEL ===== */}
      <VisualCarousel />

      {/* ===== CATEGORIES ===== */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Collections"
            title="Shop by Category"
            subtitle="From personalized gifts to luxury hampers — discover what makes your moments unforgettable."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
            {(!categories || categories.length === 0 ? PLACEHOLDER_CATEGORIES : categories).slice(0, 8).map((cat: any, i: number) => (
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

      {/* ===== SIGNATURE BUNDLE HIGH-IMPACT PROMO ===== */}
      <section className="py-6 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-[32px] border border-[#D4A853]/30 shadow-[0_20px_50px_rgba(212,168,83,0.12)] bg-gradient-to-br from-[#1E0812] to-[#0D0208] p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12"
          >
            {/* Decorative Ambient Lights */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#D4A853]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#C4607A]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left: Bundle High-End generated Image */}
            <div className="w-full lg:w-1/2 relative flex-shrink-0">
              <div className="aspect-[4/3] rounded-[24px] overflow-hidden border border-white/10 shadow-2xl relative group cursor-zoom-in">
                <img 
                  src="/products/signature-bundle.png" 
                  alt="Elunora Ultimate Handcrafted Luxury Bundle" 
                  className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-charcoal-950/80 backdrop-blur-md text-[#D4A853] px-3.5 py-1.5 rounded-full text-[9px] uppercase tracking-[0.25em] font-bold border border-[#D4A853]/30 flex items-center gap-2">
                  <Sparkles size={11} /> Studio Best Seller
                </div>
              </div>
            </div>

            {/* Right: High-Conversion Copywriting */}
            <div className="w-full lg:w-1/2 text-left space-y-6 relative z-10 text-white">
              <span className="text-[10px] font-sans tracking-[0.4em] uppercase text-[#D4A853] font-bold block">
                Signature Collection
              </span>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-white">
                The Ultimate Handcrafted <span className="italic text-[#D4A853]">Luxury Bundle</span>
              </h3>
              <p className="font-sans text-sm sm:text-base leading-relaxed text-[#C8A8B8]">
                A curated combination of our bestselling Personalized Scented Candle, hand-carved terracotta Clay Ring Dish, and organic botanical lavender mist—all elegantly arranged inside our signature keepsake dark-walnut chest with solid brass hinges.
              </p>
              
              {/* Highlight Perks */}
              <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-5">
                <div className="flex items-start gap-3">
                  <Gift size={18} className="text-[#D4A853] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-sans text-xs font-bold uppercase tracking-wider text-white">Ready-to-Gift</h5>
                    <p className="font-sans text-[10px] text-[#8A6070] mt-0.5">Complimentary wooden chest</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-[#D4A853] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-sans text-xs font-bold uppercase tracking-wider text-white">Free Express</h5>
                    <p className="font-sans text-[10px] text-[#8A6070] mt-0.5">Ships within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Price & Quick Checkout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-[#8A6070] font-bold mb-1">Special Offer</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-sans text-3xl font-black text-[#D4A853]">₹2,499</span>
                    <span className="font-sans text-sm text-[#8A6070] line-through">₹3,198</span>
                  </div>
                </div>
                <Link 
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-4.5 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[#D4A853]/20"
                  style={{ background: '#D4A853', color: '#1E0812', boxShadow: '0 10px 30px rgba(212,168,83,0.3)' }}
                >
                  <ShoppingBag size={14} /> Shop Bundle Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== INSTAGRAM REELS ===== */}
      <InstagramReels />

      {/* ===== FEATURED PRODUCTS ===== */}
      <section
        className="py-10 sm:py-16"
        style={{ background: 'linear-gradient(160deg, #FDF6EE 0%, #FFF5F7 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Curated for You"
            title="Featured Products"
            subtitle="Our most-loved, handpicked products — crafted for those who appreciate the finest things."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-8 sm:mt-12">
            {(!featuredProducts || featuredProducts.length === 0 ? PLACEHOLDER_PRODUCTS : featuredProducts).slice(0, 8).map((product: any, i: number) => (
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
        className="py-10 sm:py-16 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 55%, #1A0820 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
                Every Gift Tells<br />a Beautiful <span className="italic text-[#D4A853]">Story</span>
              </h2>
              <p className="font-sans text-lg leading-relaxed mb-6" style={{ color: '#C8A8B8' }}>
                ELUNORA was born from a simple belief: the most meaningful gifts are the ones
                made by hand, with love, and personalized for the person you cherish most.
              </p>
              <p className="font-sans leading-relaxed mb-8" style={{ color: '#8A6070' }}>
                Our artisans spend countless hours perfecting every detail — from hand-poured
                candles to intricate clay sculptures — ensuring each ELUNORA piece is worthy of
                your most precious moments.
              </p>

              {/* Luxury Studio Incentive Badge */}
              <div className="mb-10 p-5 rounded-2xl border border-[#D4A853]/20 bg-white/[0.02] backdrop-blur-md flex items-center gap-4 max-w-xl transition-colors hover:bg-white/[0.04]">
                <span className="text-2xl select-none">✨</span>
                <div>
                  <p className="text-xs font-sans font-bold text-white uppercase tracking-wider mb-1">
                    Special Studio Promotion
                  </p>
                  <p className="text-xs font-sans text-[#C8A8B8] leading-relaxed">
                    Enjoy <strong className="text-[#D4A853]">Free Premium Wooden Gift Box Packaging</strong> and a custom handwritten card on all orders above ₹999.
                  </p>
                </div>
              </div>

              <Link
                to="/products"
                className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-widest uppercase font-sans transition-all duration-300 hover:gap-5 shadow-lg hover:shadow-[#D4A853]/15 hover:scale-102"
                style={{ background: '#D4A853', color: '#1E0812' }}
              >
                Shop Collection <ArrowRight size={15} />
              </Link>
            </FadeInView>

            <FadeInView delay={0.2}>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Column 1 */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Photo 1: Clay Sculpting */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] group cursor-pointer">
                    <img
                      src="/story/artisan-1.png"
                      alt="Artisan hands sculpting clay"
                      className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                    {/* Floating Premium Badge */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[9px] font-sans font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        Pure Clay Art
                      </span>
                    </div>
                  </div>
                  
                  {/* Stat Card 1 */}
                  <div 
                    className="p-5 sm:p-6 rounded-[24px] border transition-all duration-300 hover:scale-102 hover:shadow-[0_10px_30px_rgba(212,168,83,0.08)] cursor-default text-center sm:text-left" 
                    style={{ borderColor: 'rgba(212,168,83,0.18)', background: 'linear-gradient(135deg, rgba(212,168,83,0.05) 0%, rgba(212,168,83,0.02) 100%)', backdropFilter: 'blur(8px)' }}
                  >
                    <p className="font-display text-2xl sm:text-3xl font-black mb-1.5" style={{ color: '#D4A853' }}>50,000+</p>
                    <p className="font-sans text-[10px] sm:text-xs uppercase tracking-widest font-semibold" style={{ color: '#C8A8B8' }}>Gifts Delivered</p>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-10 md:mt-12">
                  {/* Stat Card 2 */}
                  <div 
                    className="p-5 sm:p-6 rounded-[24px] border transition-all duration-300 hover:scale-102 hover:shadow-[0_10px_30px_rgba(196,96,122,0.08)] cursor-default text-center sm:text-left" 
                    style={{ borderColor: 'rgba(196,96,122,0.18)', background: 'linear-gradient(135deg, rgba(196,96,122,0.05) 0%, rgba(196,96,122,0.02) 100%)', backdropFilter: 'blur(8px)' }}
                  >
                    <p className="font-display text-2xl sm:text-3xl font-black mb-1.5" style={{ color: '#D4A853' }}>100%</p>
                    <p className="font-sans text-[10px] sm:text-xs uppercase tracking-widest font-semibold" style={{ color: '#C8A8B8' }}>Handcrafted</p>
                  </div>

                  {/* Photo 2: Luxury Scented Candles */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] group cursor-pointer">
                    <img
                      src="/story/artisan-2.png"
                      alt="Luxury scented soy candles"
                      className="w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                    {/* Floating Premium Badge */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[9px] font-sans font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        Organic Beeswax
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Just In"
            title="New Arrivals"
            subtitle="Fresh from our artisans' hands — be the first to own something truly special."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 mt-8 sm:mt-12">
            {(!newArrivals || newArrivals.length === 0 ? PLACEHOLDER_PRODUCTS : newArrivals).slice(0, 4).map((product: any, i: number) => (
              <ProductCard key={product.id || i} product={product} index={i} showNewBadge />
            ))}
          </div>
        </div>
      </section>

      {/* ===== GIFT FINDER BANNER ===== */}
      <section
        className="py-10 sm:py-14 overflow-hidden relative"
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
              recommend the perfect ELUNORA piece.
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
        className="py-10 sm:py-16"
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

      {/* ===== NEWSLETTER ===== */}
      <section
        className="py-12 sm:py-16 relative overflow-hidden"
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
              Join the ELUNORA Circle
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
    </>
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
        initial={{ y: 50, opacity: 0, skewY: 4 }}
        animate={{ y: 0, opacity: 1, skewY: 0 }}
        exit={{ y: -50, opacity: 0, skewY: -4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-0 bottom-0 flex items-center font-display leading-none"
        style={{ fontSize: size, color, letterSpacing: '-0.02em' }}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};


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
const THUMB_W = 56;
const GAP = 8;

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
      className="relative overflow-hidden py-16"
      style={{ background: '#080208' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-center mb-12">
        <p className="font-sans text-[10px] tracking-[0.48em] uppercase font-semibold" style={{ color: '#D4A853' }}>
          Discover
        </p>
        <h2 className="font-display text-white text-4xl mt-3">Our Collections</h2>
      </div>

      <div className="relative w-full max-w-7xl mx-auto h-[500px] flex items-center justify-center" style={{ perspective: 1200 }}>
        {CAROUSEL_SLIDES.map((s, i) => {
          const isActive = i === active;
          const isPrev = i === (active - 1 + N_SLIDES) % N_SLIDES;
          const isNext = i === (active + 1) % N_SLIDES;
          
          let x = 0;
          let z = 0;
          let rotateY = 0;
          let opacity = 0;
          let scale = 1;
          let zIndex = 10;

          if (isActive) {
            x = 0; z = 100; rotateY = 0; opacity = 1; scale = 1.05; zIndex = 40;
          } else if (isPrev) {
            x = -40; z = -200; rotateY = 30; opacity = 0.5; scale = 0.85; zIndex = 20;
          } else if (isNext) {
            x = 40; z = -200; rotateY = -30; opacity = 0.5; scale = 0.85; zIndex = 20;
          } else {
            // hidden in back
            x = 0; z = -400; rotateY = 0; opacity = 0; scale = 0.6; zIndex = 0;
          }

          return (
            <motion.div
              key={i}
              onClick={() => setActive(i)}
              animate={{ x: `${x}%`, z, rotateY, opacity, scale, zIndex }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.15 }}
              className="absolute top-0 w-full max-w-[320px] sm:max-w-md h-full cursor-pointer rounded-2xl overflow-hidden"
              style={{ transformStyle: 'preserve-3d', boxShadow: isActive ? `0 20px 80px ${s.accent}25` : '0 10px 30px rgba(0,0,0,0.5)' }}
            >
              {/* Background image */}
              <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              <div className="absolute inset-0 bg-black/40 transition-opacity duration-500" style={{ opacity: isActive ? 0.2 : 0.7 }} />
              
              {/* Content visible when active */}
              <motion.div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end" animate={{ opacity: isActive ? 1 : 0 }} transition={{ duration: 0.3 }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full mb-3" style={{ background: s.accent, color: '#000' }}>
                    {s.emoji} {s.statLabel}
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl text-white leading-tight mb-2">{s.title}</h3>
                  <p className="font-sans text-sm text-white/80 mb-6">{s.desc}</p>
                  <Link to={s.href} className="inline-flex items-center gap-2 font-sans text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/20">
                    Explore <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-12 relative z-20">
        {CAROUSEL_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div className="h-full" style={{ background: '#D4A853' }} animate={{ x: i === active ? '0%' : '-100%' }} transition={{ duration: 0.4 }} />
          </button>
        ))}
      </div>
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

const PLACEHOLDER_CATEGORIES = [
  { id: 'cat-0', name: 'Premium Candles', slug: 'premium-candles', image: '/categories/cat_candles_1779782736599.png' },
  { id: 'cat-1', name: 'Personalized Gifts', slug: 'personalized-gifts', image: '/categories/cat_personalized_1779782786385.png' },
  { id: 'cat-2', name: 'Clay Art', slug: 'clay-art', image: '/categories/cat_clay_1779782751534.png' },
  { id: 'cat-3', name: 'Home Decor', slug: 'home-decor', image: '/categories/cat_decor_1779787643422.png' },
  { id: 'cat-4', name: 'Couple Collections', slug: 'couple-collections', image: '/categories/cat_anniversary_1779787678679.png' },
  { id: 'cat-5', name: 'Wedding Collections', slug: 'wedding-collections', image: '/categories/cat_wedding_1779782802829.png' },
  { id: 'cat-6', name: 'Festival Collections', slug: 'festival-collections', image: '/categories/cat_diwali_1779787659129.png' },
  { id: 'cat-7', name: 'Corporate Gifting', slug: 'corporate-gifting', image: '/categories/cat_corporate_1779787626020.png' },
];

const PLACEHOLDER_PRODUCTS = [
  {
    id: 'prod-0',
    title: 'Serenity Soy Candle — Sandalwood & Vanilla',
    slug: 'serenity-soy-candle-sandalwood-vanilla',
    price: 799,
    compareAtPrice: 999,
    thumbnail: '/products/prod-1.png',
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'prod-1',
    title: 'Personalised Heart Locket Necklace',
    slug: 'personalised-heart-locket-necklace',
    price: 1499,
    compareAtPrice: 1999,
    thumbnail: '/products/prod-2.png',
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: 'prod-2',
    title: 'Terracotta Ganesha Sculpture',
    slug: 'terracotta-ganesha-sculpture',
    price: 2499,
    compareAtPrice: 2999,
    thumbnail: '/products/prod-3.png',
    rating: 5.0,
    reviewCount: 34,
  },
  {
    id: 'prod-3',
    title: 'Luxury New Year Hamper',
    slug: 'luxury-new-year-hamper',
    price: 4999,
    compareAtPrice: 6500,
    thumbnail: '/products/prod-4.png',
    rating: 4.7,
    reviewCount: 56,
  },
  {
    id: 'prod-4',
    title: 'Couple Portrait — Custom Hand-Painted',
    slug: 'couple-portrait-custom-hand-painted',
    price: 3999,
    compareAtPrice: 4999,
    thumbnail: '/products/prod-5.png',
    rating: 5.0,
    reviewCount: 22,
  },
  {
    id: 'prod-5',
    title: 'Sleek Handcrafted Clay Art Duo',
    slug: 'sleek-handcrafted-clay-art-duo',
    price: 1899,
    compareAtPrice: 2499,
    thumbnail: '/products/prod-6.png',
    rating: 4.9,
    reviewCount: 42,
  },
  {
    id: 'prod-6',
    title: 'Glowing Decorative Clay Diya',
    slug: 'glowing-decorative-clay-diya',
    price: 999,
    compareAtPrice: 1299,
    thumbnail: '/products/prod-7.png',
    rating: 4.8,
    reviewCount: 15,
  },
  {
    id: 'prod-7',
    title: 'Elunora Premium Corporate Gift Box',
    slug: 'elunora-premium-corporate-gift-box',
    price: 3499,
    compareAtPrice: 4500,
    thumbnail: '/products/prod-8.png',
    rating: 5.0,
    reviewCount: 28,
  },
];

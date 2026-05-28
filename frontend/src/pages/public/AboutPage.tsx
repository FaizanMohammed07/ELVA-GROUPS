import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award, Globe, Users, Leaf, Zap, Heart, Star } from 'lucide-react';
import { SEOHead } from '@components/seo/SEOHead';

const ABOUT_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://www.elunoracrafts.com/about#webpage',
    'url': 'https://www.elunoracrafts.com/about',
    'name': 'About ELUNORA — Our Story, Mission & Ecosystem',
    'description': "ELUNORA is India's premium handcrafted gifting brand, backed by DEVUP Ecosystem at VJIT. 50+ artisan partners, 500+ handcrafted products, shipped pan-India.",
    'isPartOf': { '@id': 'https://www.elunoracrafts.com/#website' },
    'about': { '@id': 'https://www.elunoracrafts.com/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'About', 'item': 'https://www.elunoracrafts.com/about' },
    ],
  },
];

const STATS = [
  { value: 10000, suffix: '+', label: 'Gifts Delivered', sub: 'and counting' },
  { value: 500, suffix: '+', label: 'Unique Products', sub: 'all handcrafted' },
  { value: 50, suffix: '+', label: 'Artisan Partners', sub: 'across India' },
  { value: 200, suffix: '+', label: 'Cities Reached', sub: 'pan-India' },
];

const VALUES = [
  { icon: Users, title: 'Artisan First', body: 'Our artisan partners are not vendors — they are co-creators. Fair pay, skill investment, and long-term partnerships are non-negotiable at ELUNORA.' },
  { icon: Heart, title: 'Deep Personalisation', body: 'Gifts become heirlooms when they carry personal meaning. We make personalisation central — every custom detail elevates a product into something irreplaceable.' },
  { icon: Leaf, title: 'Ethical & Sustainable', body: 'Natural waxes, FSC-certified wood, recyclable packaging. We are on a clear trajectory toward zero-waste gifting by 2026, making sustainability a lived practice.' },
  { icon: Award, title: 'Uncompromising Quality', body: 'Every product passes a handcraft quality check before dispatch. We delay shipments rather than compromise on the standard our customers deserve.' },
  { icon: Zap, title: 'Technology-Powered', body: 'Startup-grade engineering meets gifting — smart personalisation, reliable logistics, real-time tracking, and a seamless experience powered by DEVUP Ecosystem.' },
  { icon: Globe, title: 'Community-Driven', body: 'ELUNORA is built by a developer community that believes technology and craftsmanship amplify each other. We are a startup that thinks like a brand.' },
];

const CRAFTS = [
  { name: 'Clay Art', origin: 'Jaipur & Varanasi', detail: 'Hand-shaped. Kiln-fired. Mineral-painted. Each piece takes 3–5 days.' },
  { name: 'Luxury Candles', origin: 'Bangalore & Mumbai', detail: 'Hand-poured soy & beeswax. Premium fragrance blends. Small-batch crafted.' },
  { name: 'Personalised Keepsakes', origin: 'Pan-India', detail: 'Engraving, calligraphy, resin art. Every detail made for one person.' },
  { name: 'Gift Hampers', origin: 'Mumbai', detail: 'Curated by specialists. Layered by hand. Sealed with intention.' },
];

function AnimatedCounter({ target, suffix, duration = 2 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
}

function FadeSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const [activeValue, setActiveValue] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveValue((v) => (v + 1) % VALUES.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <SEOHead
        title="About ELUNORA — Our Story, Mission & Artisan Ecosystem"
        description="ELUNORA is India's premium handcrafted gifting brand, backed by DEVUP Ecosystem at VJIT. 50+ artisan partners, 500+ handcrafted products, shipped pan-India. Ethical, premium, made with love."
        keywords="about ELUNORA, handcrafted gifting brand India, DEVUP Ecosystem, artisan gifting, ELUNORA story, VJIT startup, Indian artisans, premium gifting India"
        schema={ABOUT_SCHEMA as any}
      />

      <div className="min-h-screen overflow-x-hidden">

        {/* ══════════════════════════════ HERO ══════════════════════════════ */}
        <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #050108 0%, #160A14 40%, #2E1428 100%)' }}>

          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)' }} />
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute -bottom-20 right-10 w-80 h-80 rounded-full"
              style={{ background: 'radial-gradient(circle, #C4607A 0%, transparent 70%)' }} />
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'linear-gradient(rgba(212,168,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,83,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          </div>

          <motion.div style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-28 pb-20">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full"
                style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)' }}>
                <Sparkles size={12} style={{ color: '#D4A853' }} />
                <span className="font-sans text-xs tracking-[0.3em] uppercase" style={{ color: '#D4A853' }}>Our Story</span>
              </motion.div>

              {/* H1 */}
              <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-white mb-8"
                style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
                Built on Craft.<br />
                <span style={{
                  background: 'linear-gradient(135deg, #D4A853 0%, #F0D090 50%, #D4A853 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Driven by Heart.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="font-sans max-w-xl leading-relaxed mb-10"
                style={{ color: '#8A6070', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)' }}>
                ELUNORA is India's premium handcrafted gifting and lifestyle ecosystem — where artisan skill, emotional storytelling, and modern technology converge to create gifts that genuinely matter.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4">
                <Link to="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-sans text-sm font-semibold transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #D4A853 0%, #B8902A 100%)', color: '#1A0812' }}>
                  Explore Our Collection
                  <ArrowRight size={14} />
                </Link>
                <Link to="/our-craft"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-sans text-sm font-semibold transition-transform hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                  Our Craft Story
                </Link>
              </motion.div>
            </div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-5">
              {STATS.map(({ value, suffix, label, sub }) => (
                <div key={label} className="px-5 py-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="font-serif mb-0.5"
                    style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#D4A853', lineHeight: 1 }}>
                    <AnimatedCounter target={value} suffix={suffix} />
                  </p>
                  <p className="font-sans text-xs font-semibold text-white">{label}</p>
                  <p className="font-sans text-xs" style={{ color: '#5A3040' }}>{sub}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════ WHY WE STARTED ═══════════════════════════ */}
        <section className="py-28 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-6xl mx-auto">
            <FadeSection>
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div>
                  <p className="font-sans text-xs tracking-[0.45em] uppercase mb-5 font-semibold" style={{ color: '#D4A853' }}>
                    Why We Started
                  </p>
                  <h2 className="font-serif mb-8"
                    style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#1A0812', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                    Every Gift Should<br />Tell a Story
                  </h2>
                  <div className="space-y-5 font-sans text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                    <p>
                      ELUNORA was born from a shared frustration: why does everything in Indian ecommerce look the same? Mass-produced mugs, plastic trinkets, forgettable dry-fruit boxes — none of it felt like a real gift. None of it felt made <em>for someone</em>.
                    </p>
                    <p>
                      Meanwhile, India has thousands of world-class artisans — clay sculptors, wax pourers, calligraphers, weave artists — producing extraordinary objects in studios across Jaipur, Varanasi, Bangalore, and Mumbai. They lacked not skill, but stage.
                    </p>
                    <p style={{ color: '#1A0812', fontWeight: 500 }}>
                      ELUNORA became that stage. A platform where artisan excellence meets emotional gifting — where every product carries a story, a maker, and a meaning.
                    </p>
                  </div>
                </div>

                {/* Visual panel */}
                <div className="relative">
                  <div className="rounded-3xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1E0812 0%, #2E1428 100%)', minHeight: '420px' }}>
                    {/* Decorative inner */}
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, #D4A853 0%, transparent 60%)' }} />
                    <div className="relative z-10 p-10 h-full flex flex-col justify-between" style={{ minHeight: '420px' }}>
                      {/* Quote */}
                      <div>
                        <div className="text-5xl font-serif mb-4" style={{ color: 'rgba(212,168,83,0.3)' }}>"</div>
                        <p className="font-serif text-xl leading-snug text-white" style={{ letterSpacing: '-0.01em' }}>
                          The most meaningful gifts are made by human hands, shaped by human skill, and given with human intention.
                        </p>
                      </div>
                      {/* Bottom attribute */}
                      <div className="flex items-center gap-3 mt-8">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(212,168,83,0.15)', border: '1px solid rgba(212,168,83,0.3)' }}>
                          <Star size={12} style={{ color: '#D4A853' }} />
                        </div>
                        <div>
                          <p className="font-sans text-xs font-semibold text-white">ELUNORA</p>
                          <p className="font-sans text-xs" style={{ color: '#8A6070' }}>Our founding belief</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floating badge */}
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -bottom-5 -left-5 px-4 py-3 rounded-2xl shadow-xl"
                    style={{ background: '#D4A853', color: '#1A0812' }}>
                    <p className="font-sans font-bold text-sm">50+ Artisans</p>
                    <p className="font-sans text-xs opacity-70">across India</p>
                  </motion.div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ═══════════════════════════ MISSION + VISION ═══════════════════════════ */}
        <section className="py-28 px-4 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #080208 0%, #1E0812 55%, #2E1428 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <FadeSection>
              <div className="text-center mb-16">
                <p className="font-sans text-xs tracking-[0.45em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>
                  Our Purpose
                </p>
                <h2 className="font-serif text-white"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}>
                  Mission & Vision
                </h2>
              </div>
            </FadeSection>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  label: 'Mission',
                  heading: 'Redefine what a gift can mean',
                  body: 'To build India\'s most trusted platform for premium handcrafted gifting — where every product tells a story, every artisan earns fairly, and every customer feels the difference between a gift and a gesture.',
                  accent: '#D4A853',
                  border: 'rgba(212,168,83,0.2)',
                },
                {
                  label: 'Vision',
                  heading: 'Make Indian craft globally loved',
                  body: 'To put Indian artisanship on the world map — not as "cheap exports" but as premium lifestyle objects, made with exceptional skill, sold at the values they deserve, discovered by customers who appreciate craft.',
                  accent: '#C4607A',
                  border: 'rgba(196,96,122,0.2)',
                },
              ].map(({ label, heading, body, accent, border }, i) => (
                <FadeSection key={label} delay={i * 0.12}>
                  <div className="relative p-9 rounded-3xl h-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
                      style={{ background: accent, transform: 'translate(30%, -30%)' }} />
                    <span className="inline-block font-sans text-xs tracking-widest uppercase mb-4 px-3 py-1 rounded-full font-semibold"
                      style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                      {label}
                    </span>
                    <h3 className="font-serif text-white text-2xl mb-4" style={{ lineHeight: 1.2 }}>{heading}</h3>
                    <p className="font-sans text-sm leading-relaxed" style={{ color: '#8A6070' }}>{body}</p>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════ VALUES (interactive) ═══════════════════════════ */}
        <section className="py-28 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-6xl mx-auto">
            <FadeSection>
              <div className="text-center mb-16">
                <p className="font-sans text-xs tracking-[0.45em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>
                  What We Stand For
                </p>
                <h2 className="font-serif"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#1A0812', letterSpacing: '-0.02em' }}>
                  Values That Don't Move
                </h2>
              </div>
            </FadeSection>

            {/* Desktop: interactive two-column */}
            <div className="hidden md:grid md:grid-cols-2 gap-6">
              {/* Left: list */}
              <FadeSection>
                <div className="space-y-2">
                  {VALUES.map(({ icon: Icon, title }, i) => (
                    <button key={title} onClick={() => setActiveValue(i)}
                      className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300"
                      style={{
                        background: activeValue === i ? 'linear-gradient(135deg, #1E0812 0%, #2E1428 100%)' : 'white',
                        border: activeValue === i ? '1px solid rgba(212,168,83,0.25)' : '1px solid rgba(0,0,0,0.06)',
                        transform: activeValue === i ? 'translateX(4px)' : 'translateX(0)',
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: activeValue === i ? 'rgba(212,168,83,0.15)' : 'rgba(212,168,83,0.08)',
                          border: `1px solid ${activeValue === i ? 'rgba(212,168,83,0.35)' : 'rgba(212,168,83,0.15)'}`,
                        }}>
                        <Icon size={15} style={{ color: '#D4A853' }} />
                      </div>
                      <span className="font-sans font-semibold text-sm"
                        style={{ color: activeValue === i ? 'white' : '#1A1A1A' }}>
                        {title}
                      </span>
                      {activeValue === i && (
                        <ArrowRight size={14} className="ml-auto" style={{ color: '#D4A853' }} />
                      )}
                    </button>
                  ))}
                </div>
              </FadeSection>

              {/* Right: detail */}
              <FadeSection delay={0.1}>
                <div className="sticky top-28">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeValue}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35 }}
                      className="p-10 rounded-3xl h-72 flex flex-col justify-between"
                      style={{ background: 'linear-gradient(135deg, #1E0812 0%, #2E1428 100%)', border: '1px solid rgba(212,168,83,0.15)' }}>
                      <div>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                          style={{ background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.2)' }}>
                          {(() => { const Icon = VALUES[activeValue].icon; return <Icon size={22} style={{ color: '#D4A853' }} />; })()}
                        </div>
                        <h3 className="font-serif text-white text-2xl mb-4">{VALUES[activeValue].title}</h3>
                        <p className="font-sans text-sm leading-relaxed" style={{ color: '#8A6070' }}>{VALUES[activeValue].body}</p>
                      </div>
                      <div className="flex gap-1.5 mt-4">
                        {VALUES.map((_, i) => (
                          <div key={i} className="h-1 rounded-full transition-all duration-300"
                            style={{ width: i === activeValue ? '24px' : '6px', background: i === activeValue ? '#D4A853' : 'rgba(212,168,83,0.2)' }} />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </FadeSection>
            </div>

            {/* Mobile: grid */}
            <div className="grid sm:grid-cols-2 gap-4 md:hidden">
              {VALUES.map(({ icon: Icon, title, body }, i) => (
                <FadeSection key={title} delay={i * 0.07}>
                  <div className="p-5 rounded-2xl h-full" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.15)' }}>
                      <Icon size={15} style={{ color: '#D4A853' }} />
                    </div>
                    <h3 className="font-sans font-semibold text-sm mb-2" style={{ color: '#1A1A1A' }}>{title}</h3>
                    <p className="font-sans text-xs leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════ CRAFTS SHOWCASE ═══════════════════════════ */}
        <section className="py-28 px-4"
          style={{ background: 'linear-gradient(180deg, #1A0812 0%, #080208 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <FadeSection>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
                <div>
                  <p className="font-sans text-xs tracking-[0.45em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>
                    Our Artisans
                  </p>
                  <h2 className="font-serif text-white"
                    style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}>
                    50+ Masters of Their Craft
                  </h2>
                </div>
                <Link to="/our-craft" className="inline-flex items-center gap-2 font-sans text-sm"
                  style={{ color: '#D4A853' }}>
                  Full Craftsmanship Story <ArrowRight size={14} />
                </Link>
              </div>
            </FadeSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CRAFTS.map(({ name, origin, detail }, i) => (
                <FadeSection key={name} delay={i * 0.08}>
                  <div className="group p-6 rounded-2xl h-full transition-all duration-300 cursor-default"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(212,168,83,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,83,0.05)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>
                    {/* Craft number */}
                    <p className="font-display text-5xl font-bold mb-4"
                      style={{ color: 'rgba(212,168,83,0.12)', lineHeight: 1 }}>
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 className="font-serif text-lg text-white mb-1">{name}</h3>
                    <p className="font-sans text-xs mb-3 font-semibold" style={{ color: '#D4A853' }}>{origin}</p>
                    <p className="font-sans text-xs leading-relaxed" style={{ color: '#5A3040' }}>{detail}</p>
                  </div>
                </FadeSection>
              ))}
            </div>

            <FadeSection delay={0.2}>
              <div className="mt-10 p-7 rounded-2xl"
                style={{ background: 'rgba(212,168,83,0.05)', border: '1px solid rgba(212,168,83,0.12)' }}>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="font-serif text-white text-xl mb-2">Want to become an ELUNORA artisan partner?</h3>
                    <p className="font-sans text-sm" style={{ color: '#8A6070' }}>
                      We are always looking for skilled craftspeople across India. Fair pay, national reach, long-term partnership.
                    </p>
                  </div>
                  <a href="mailto:artisans@elunoracrafts.com"
                    className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-sans text-sm font-semibold"
                    style={{ background: 'rgba(212,168,83,0.12)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}>
                    Apply to Partner
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ═══════════════════════════ DEVUP ECOSYSTEM ═══════════════════════════ */}
        <section className="py-28 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-6xl mx-auto">
            <FadeSection>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <p className="font-sans text-xs tracking-[0.45em] uppercase mb-5 font-semibold" style={{ color: '#D4A853' }}>
                    The Ecosystem
                  </p>
                  <h2 className="font-serif mb-8"
                    style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#1A0812', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                    Where Technology<br />Meets Craft
                  </h2>
                  <div className="space-y-4 font-sans text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                    <p>
                      Most gifting platforms are either beautifully designed but poorly engineered, or technically robust but soulless. ELUNORA sits at an unusual intersection: <strong style={{ color: '#1A1A1A' }}>startup-grade technology applied to a world of handcrafted, emotionally driven gifting.</strong>
                    </p>
                    <p>
                      This is made possible by <strong style={{ color: '#1A1A1A' }}>DEVUP Ecosystem</strong> — a developer society and startup incubator at VJIT (Vivekanand Institute of Technology), Mumbai — which provides the technical infrastructure, mentorship network, and startup discipline that allows ELUNORA to operate like a funded venture.
                    </p>
                    <p>
                      Our customers get the trust of a technically rigorous, secure platform and the warmth of a brand that genuinely cares about craft, artisans, and the feeling a gift creates.
                    </p>
                  </div>
                </div>

                {/* DEVUP card */}
                <div className="space-y-4">
                  <div className="rounded-3xl p-8"
                    style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 100%)', border: '1px solid rgba(212,168,83,0.2)' }}>
                    <p className="font-sans text-xs tracking-widest uppercase mb-2 font-semibold" style={{ color: '#D4A853' }}>
                      Backed & Incubated By
                    </p>
                    <h3 className="font-serif text-white text-2xl mb-5">DEVUP Ecosystem</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'DEVUP Ecosystem', sub: 'Startup incubator & developer community', href: 'https://www.devupecosystem.com' },
                        { name: 'DEVUP Society, VJIT', sub: 'College developer society & innovation hub', href: 'https://www.devupvjit.in' },
                      ].map(({ name, sub, href }) => (
                        <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 rounded-2xl group transition-all duration-200"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,83,0.1)' }}
                          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,83,0.3)'}
                          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,83,0.1)'}>
                          <div>
                            <p className="font-sans font-semibold text-sm" style={{ color: '#D4A853' }}>{name}</p>
                            <p className="font-sans text-xs" style={{ color: '#5A3040' }}>{sub}</p>
                          </div>
                          <ArrowRight size={14} style={{ color: '#5A3040' }} />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Pillars */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Technology', detail: 'Enterprise-grade platform' },
                      { label: 'Mentorship', detail: 'Startup incubation' },
                      { label: 'Community', detail: 'Developer-built brand' },
                    ].map(({ label, detail }) => (
                      <div key={label} className="p-3 rounded-xl text-center"
                        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <p className="font-sans font-semibold text-xs mb-1" style={{ color: '#1A1A1A' }}>{label}</p>
                        <p className="font-sans text-xs" style={{ color: '#9CA3AF' }}>{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ═══════════════════════════ SUSTAINABILITY ═══════════════════════════ */}
        <section className="py-28 px-4"
          style={{ background: 'linear-gradient(160deg, #050A07 0%, #0A1A0E 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <FadeSection>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <p className="font-sans text-xs tracking-[0.45em] uppercase mb-5 font-semibold" style={{ color: '#059669' }}>
                    Sustainability
                  </p>
                  <h2 className="font-serif text-white mb-8"
                    style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                    Gifting Should Not<br />Cost the Earth
                  </h2>
                  <div className="space-y-4 font-sans text-sm leading-relaxed" style={{ color: '#6BBAA0' }}>
                    <p>
                      The gifting industry generates enormous waste — plastic packaging, synthetic materials, fast-consumed disposables. We are building a different model.
                    </p>
                    <p>
                      At ELUNORA, sustainability is embedded in our material choices, our packaging decisions, and our supplier agreements. We are on a clear trajectory toward zero-waste gifting with a target of carbon-neutral operations by 2026.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Natural candle waxes (soy & beeswax)', pct: 100 },
                    { label: 'Recyclable outer packaging', pct: 100 },
                    { label: 'Biodegradable inner fills', pct: 80 },
                    { label: 'FSC-certified wood products', pct: 75 },
                    { label: 'Carbon-neutral supply chain (target 2026)', pct: 30 },
                  ].map(({ label, pct }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-sans text-xs" style={{ color: '#6BBAA0' }}>{label}</span>
                        <span className="font-sans text-xs font-bold" style={{ color: '#059669' }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(5,150,105,0.1)' }}>
                        <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #059669 0%, #6BBAA0 100%)' }}
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ═══════════════════════════ FINAL CTA ═══════════════════════════ */}
        <section className="py-28 px-4" style={{ background: '#FAFAF8' }}>
          <FadeSection>
            <div className="max-w-3xl mx-auto text-center">
              <p className="font-sans text-xs tracking-[0.45em] uppercase mb-5 font-semibold" style={{ color: '#D4A853' }}>
                Be Part of the Story
              </p>
              <h2 className="font-serif mb-6"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', color: '#1A0812', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
                Shop, Gift,<br />Support Artisans
              </h2>
              <p className="font-sans text-base mb-10 leading-relaxed max-w-md mx-auto" style={{ color: '#6B7280' }}>
                Every ELUNORA order supports a skilled artisan, funds sustainable practices, and sends a gift that will be remembered long after the occasion passes.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/products"
                  className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-sans text-sm font-semibold transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #1E0812 0%, #2E1428 100%)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>
                  Shop All Gifts
                  <ArrowRight size={14} />
                </Link>
                <Link to="/our-craft"
                  className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-sans text-sm font-semibold transition-transform hover:scale-105"
                  style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}>
                  Our Craft Story
                </Link>
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl font-sans text-sm transition-transform hover:scale-105"
                  style={{ background: 'white', color: '#6B7280', border: '1px solid rgba(0,0,0,0.1)' }}>
                  Partner With Us
                </Link>
              </div>
            </div>
          </FadeSection>
        </section>
      </div>
    </>
  );
}

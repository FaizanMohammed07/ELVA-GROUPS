import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': 'https://www.elunoracrafts.com/our-craft#article',
  'headline': 'The ELUNORA Craftsmanship Story — Handmade, Ethical, Purposeful',
  'description': 'Discover the philosophy, artisans, materials, and story behind ELUNORA\'s handcrafted gifting ecosystem. Built on skill, love, and a belief that every gift should tell a story.',
  'url': 'https://www.elunoracrafts.com/our-craft',
  'author': { '@type': 'Organization', 'name': 'ELUNORA', '@id': 'https://www.elunoracrafts.com/#organization' },
  'publisher': { '@id': 'https://www.elunoracrafts.com/#organization' },
  'isPartOf': { '@id': 'https://www.elunoracrafts.com/#website' },
  'about': [
    { '@type': 'Thing', 'name': 'Handcrafted gifts' },
    { '@type': 'Thing', 'name': 'Artisan craftsmanship' },
    { '@type': 'Thing', 'name': 'Personalised gifting' },
    { '@type': 'Thing', 'name': 'Sustainable gifting' },
    { '@type': 'Thing', 'name': 'Indian artisans' },
  ],
  'keywords': 'handcrafted gifts, Indian artisans, sustainable gifting, personalised gifts, clay art, luxury candles, ELUNORA craftsmanship',
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' },
    { '@type': 'ListItem', 'position': 2, 'name': 'Our Craft', 'item': 'https://www.elunoracrafts.com/our-craft' },
  ],
};

const CRAFTS = [
  {
    name: 'Clay Art',
    origin: 'Rajasthan & Uttar Pradesh',
    process: 'Hand-shaped from natural clay, sun-dried, kiln-fired at 1,000°C, hand-painted with mineral pigments.',
    detail: 'Each clay piece takes 3–5 days from shaping to painting. Our artisans in Jaipur and Varanasi have inherited these techniques across generations, blending traditional forms with modern aesthetics.',
    emoji: '🏺',
    color: '#F9C090',
  },
  {
    name: 'Luxury Candles',
    origin: 'Karnataka & Maharashtra',
    process: 'Hand-poured in small batches using natural soy wax, pure beeswax, and cotton wicks. Scented with premium fragrance oils and essential oils.',
    detail: 'Each candle is poured, cooled, and quality-checked by hand. Our candle artisans blend fragrance profiles that evoke emotions — calm, celebration, romance, and nostalgia.',
    emoji: '🕯️',
    color: '#D4A853',
  },
  {
    name: 'Personalised Keepsakes',
    origin: 'Pan-India',
    process: 'Custom engraving, calligraphy, resin art, and digital textile printing — each technique selected for the material and desired permanence.',
    detail: 'Personalisation is the heart of ELUNORA. From laser-engraved wood to hand-calligraphed parchment, our artisans ensure your specific message becomes a permanent, beautiful part of the gift.',
    emoji: '✍️',
    color: '#C8A8FF',
  },
  {
    name: 'Gift Hampers',
    origin: 'Curated across India',
    process: 'Each hamper is curated by our gifting specialists, layered by hand, wrapped in eco-friendly tissue, and sealed in our premium kraft or textile boxes.',
    detail: 'Hamper assembly is an art. Our curators balance textures, scents, colours, and utility — creating an unboxing experience that begins before the first product is even unwrapped.',
    emoji: '🧺',
    color: '#90F4C0',
  },
];

const VALUES = [
  {
    title: 'Artisan-First',
    body: 'Every rupee spent at ELUNORA directly supports a skilled artisan. We believe the maker deserves to be known, valued, and fairly compensated. No mass factories. No exploitative margins.',
    icon: '👐',
  },
  {
    title: 'Ethically Sourced',
    body: 'We source materials responsibly — natural soy and beeswax, non-toxic pigments, FSC-certified wood, and recycled packaging. Sustainability is not an add-on; it is embedded in every decision.',
    icon: '🌿',
  },
  {
    title: 'Slow & Intentional',
    body: 'We resist the pressure to produce fast. Every ELUNORA piece takes time — time for skill, for love, for attention to detail. This is why our gifts carry a different energy than anything mass-produced.',
    icon: '⏳',
  },
  {
    title: 'Deeply Personal',
    body: 'A gift without personalisation is just a product. We go further — asking about the recipient, the occasion, the emotion — and crafting gifts that feel like they were made specifically for one person.',
    icon: '💌',
  },
];

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export default function OurCraftPage() {
  return (
    <>
      <SEOHead
        title="Our Craft — The Story Behind ELUNORA's Handmade Gifts"
        description="Discover how ELUNORA's handcrafted gifts are made — from clay art in Rajasthan to luxury candles in Bangalore. Meet our artisans, materials, and sustainable philosophy."
        keywords="ELUNORA craftsmanship, handmade gifts India, Indian artisans, clay art, luxury candles, sustainable gifting, personalised gifts story"
        schema={[ARTICLE_SCHEMA, BREADCRUMB_SCHEMA] as any}
      />

      <div className="min-h-screen overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #080208 0%, #1E0812 50%, #2E1428 100%)' }}>
          {/* Background texture */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #D4A853 0%, transparent 50%), radial-gradient(circle at 75% 75%, #C4607A 0%, transparent 50%)' }} />

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-28 pb-20">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 mb-6 px-5 py-2 rounded-full text-xs font-sans tracking-widest uppercase"
              style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)', color: '#D4A853' }}>
              <span>✦</span> The ELUNORA Story <span>✦</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9 }}
              className="font-serif text-white mb-6"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Where Skill Meets<br />
              <em style={{ color: '#D4A853', fontStyle: 'italic' }}>Intention</em>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="font-sans max-w-2xl mx-auto leading-relaxed"
              style={{ color: '#8A6070', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>
              ELUNORA was built on one conviction: the most meaningful gifts are made by human hands, shaped by human skill, and given with human intention. Every product in our collection carries this truth.
            </motion.p>

            {/* Scroll indicator */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="mt-12 flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-px h-10 opacity-30" style={{ background: 'linear-gradient(to bottom, transparent, #D4A853)' }} />
                <span className="font-sans text-xs tracking-widest uppercase" style={{ color: '#5A3040' }}>Scroll</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Origin Story ── */}
        <section className="py-24 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <p className="font-sans text-xs tracking-[0.4em] uppercase mb-4 font-semibold" style={{ color: '#D4A853' }}>
                    How It Began
                  </p>
                  <h2 className="font-serif mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#1A0812', lineHeight: 1.2 }}>
                    A Reaction to the Age of Everything Ordinary
                  </h2>
                  <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: '#4B5563' }}>
                    ELUNORA was founded when its creators kept asking the same question while browsing gifting sites: why does everything look the same? Generic candles. Plastic trinkets. Mass-printed mugs. None of it felt like a real gift — none of it felt like it had been made <em>for someone</em>.
                  </p>
                  <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: '#4B5563' }}>
                    Meanwhile, India has thousands of world-class artisans — clay sculptors, wax pourers, calligraphers, textile artists — working in studios and homes across the country, producing objects of extraordinary beauty. The problem wasn't a shortage of craft. It was a shortage of the right stage.
                  </p>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                    ELUNORA became that stage. A platform where artisan skill meets emotional gifting — where every product has a story, a maker, and a meaning.
                  </p>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: '50+', label: 'Artisan Partners', sub: 'across India' },
                      { value: '500+', label: 'Unique Designs', sub: 'all handcrafted' },
                      { value: '10,000+', label: 'Gifts Delivered', sub: 'with love' },
                      { value: '200+', label: 'Cities Reached', sub: 'pan-India' },
                    ].map(({ value, label, sub }) => (
                      <div key={label} className="p-5 rounded-xl text-center"
                        style={{ background: 'linear-gradient(135deg, #1E0812 0%, #2E1428 100%)', border: '1px solid rgba(212,168,83,0.15)' }}>
                        <p className="font-serif text-2xl mb-1" style={{ color: '#D4A853' }}>{value}</p>
                        <p className="font-sans text-xs font-semibold" style={{ color: 'white' }}>{label}</p>
                        <p className="font-sans text-xs" style={{ color: '#8A6070' }}>{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ── The Crafts ── */}
        <section className="py-24 px-4" style={{ background: 'linear-gradient(180deg, #1A0812 0%, #080208 100%)' }}>
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <div className="text-center mb-16">
                <p className="font-sans text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>
                  The Crafts We Champion
                </p>
                <h2 className="font-serif text-white" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
                  Every Technique Has a Soul
                </h2>
              </div>
            </FadeSection>

            <div className="grid md:grid-cols-2 gap-6">
              {CRAFTS.map((craft, i) => (
                <FadeSection key={craft.name} delay={i * 0.1}>
                  <div className="p-7 rounded-2xl h-full"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-start gap-4 mb-5">
                      <span style={{ fontSize: '2rem' }}>{craft.emoji}</span>
                      <div>
                        <h3 className="font-serif text-xl text-white mb-1">{craft.name}</h3>
                        <p className="font-sans text-xs" style={{ color: craft.color }}>
                          Origin: {craft.origin}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="px-3 py-2.5 rounded-lg text-xs font-sans leading-relaxed"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#C4A0B0', borderLeft: `2px solid ${craft.color}` }}>
                        <strong style={{ color: craft.color }}>Process:</strong> {craft.process}
                      </div>
                      <p className="font-sans text-sm leading-relaxed" style={{ color: '#8A6070' }}>
                        {craft.detail}
                      </p>
                    </div>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Artisan Commitment ── */}
        <section className="py-24 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                <div>
                  <p className="font-sans text-xs tracking-[0.4em] uppercase mb-4 font-semibold" style={{ color: '#D4A853' }}>
                    Our Artisan Commitment
                  </p>
                  <h2 className="font-serif mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#1A0812', lineHeight: 1.2 }}>
                    The Maker is Not Anonymous Here
                  </h2>
                  <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: '#4B5563' }}>
                    In the traditional supply chain, the artisan is invisible. A factory somewhere, a reference number in a spreadsheet. ELUNORA rejects this model.
                  </p>
                  <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: '#4B5563' }}>
                    Every artisan partner we work with is known to us — we visit their studios, understand their technique, and work together to develop products that honour their skill while meeting our customers' expectations of quality.
                  </p>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                    We pay fair prices, always. No margin squeezing. No exploitative bulk discounts that come at the artisan's cost. We believe that when a maker is paid fairly, it shows in the work.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: '💰', title: 'Fair Pricing, Always', body: 'Artisan partners are paid market-plus rates. We will not cut corners at their expense.' },
                    { icon: '🛠️', title: 'Skill Development', body: 'We invest in workshops and tools that help artisans refine their craft and take on more complex commissions.' },
                    { icon: '📣', title: 'Amplified Reach', body: 'ELUNORA gives artisans a national customer base they could never access independently through a single store or marketplace listing.' },
                    { icon: '🤝', title: 'Long-Term Partnerships', body: 'We build ongoing relationships. Artisans who join ELUNORA become part of our creative family, not just vendors on a list.' },
                  ].map(({ icon, title, body }) => (
                    <div key={title} className="flex gap-4 p-4 rounded-xl"
                      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <span className="text-2xl flex-shrink-0">{icon}</span>
                      <div>
                        <h4 className="font-sans font-semibold text-sm mb-1" style={{ color: '#1A1A1A' }}>{title}</h4>
                        <p className="font-sans text-xs leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="py-24 px-4" style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 100%)' }}>
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <div className="text-center mb-14">
                <p className="font-sans text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>
                  What We Believe
                </p>
                <h2 className="font-serif text-white" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
                  The Philosophy of the Handmade
                </h2>
              </div>
            </FadeSection>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {VALUES.map((v, i) => (
                <FadeSection key={v.title} delay={i * 0.08}>
                  <div className="p-6 rounded-2xl h-full"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-3xl mb-4 block">{v.icon}</span>
                    <h3 className="font-serif text-lg text-white mb-3">{v.title}</h3>
                    <p className="font-sans text-xs leading-relaxed" style={{ color: '#8A6070' }}>{v.body}</p>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sustainability ── */}
        <section className="py-24 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div>
                  <p className="font-sans text-xs tracking-[0.4em] uppercase mb-4 font-semibold" style={{ color: '#059669' }}>
                    Sustainability
                  </p>
                  <h2 className="font-serif mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#1A0812', lineHeight: 1.2 }}>
                    Gifting Should Not Cost the Earth
                  </h2>
                  <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: '#4B5563' }}>
                    The gifting industry generates enormous waste — plastic packaging, synthetic materials, fast-consumed disposables. We are building a different model.
                  </p>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                    At ELUNORA, sustainability is not a marketing statement. It is embedded in our material choices, our packaging decisions, and our supplier agreements. We are not perfect yet — but we are committed to a clear trajectory toward zero-waste gifting.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Natural waxes (soy, beeswax)', pct: 100, color: '#059669' },
                    { label: 'Recyclable outer packaging', pct: 100, color: '#059669' },
                    { label: 'Biodegradable inner fills', pct: 80, color: '#D4A853' },
                    { label: 'FSC-certified wood items', pct: 75, color: '#D4A853' },
                    { label: 'Carbon-neutral supply chain (target 2026)', pct: 30, color: '#C4607A' },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-sans text-xs" style={{ color: '#374151' }}>{label}</span>
                        <span className="font-sans text-xs font-semibold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                        <motion.div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }}
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ── DEVUP Ecosystem ── */}
        <section className="py-24 px-4" style={{ background: 'linear-gradient(160deg, #0A0214 0%, #1A0812 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <FadeSection>
              <div className="text-center mb-12">
                <p className="font-sans text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>
                  The Ecosystem Behind ELUNORA
                </p>
                <h2 className="font-serif text-white mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
                  Where Technology Meets Craft
                </h2>
                <p className="font-sans max-w-2xl mx-auto leading-relaxed" style={{ color: '#8A6070' }}>
                  ELUNORA is backed and incubated by <strong style={{ color: '#D4A853' }}>DEVUP Ecosystem</strong> — a developer society and startup incubator at VJIT (Vivekanand Institute of Technology), Mumbai. This gives us something rare: a gifting brand powered by enterprise-grade technology and startup thinking.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5 mb-10">
                {[
                  { icon: '💻', title: 'Technology First', body: 'Our platform is built with the same rigor as enterprise software — scalable, secure, and designed for growth. Orders, personalisation, and logistics are managed with engineering precision.' },
                  { icon: '🎓', title: 'Startup Incubation', body: 'DEVUP Ecosystem provides mentorship, resources, and network access that allows ELUNORA to operate and grow like a funded startup — even at an early stage.' },
                  { icon: '🌐', title: 'Community Backed', body: 'Behind ELUNORA is a community of developers, designers, marketers, and operators who believe in the mission of making Indian artisan craft globally visible.' },
                ].map(({ icon, title, body }) => (
                  <div key={title} className="p-6 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,83,0.12)' }}>
                    <span className="text-3xl mb-4 block">{icon}</span>
                    <h3 className="font-serif text-lg text-white mb-2">{title}</h3>
                    <p className="font-sans text-xs leading-relaxed" style={{ color: '#8A6070' }}>{body}</p>
                  </div>
                ))}
              </div>

              <div className="text-center flex flex-wrap gap-4 justify-center">
                <a href="https://www.devupecosystem.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans font-semibold"
                  style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}>
                  DEVUP Ecosystem ↗
                </a>
                <a href="https://www.devupvjit.in" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#C4A0B0', border: '1px solid rgba(255,255,255,0.08)' }}>
                  DEVUP Society, VJIT ↗
                </a>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-4" style={{ background: '#FAFAF8' }}>
          <FadeSection>
            <div className="max-w-2xl mx-auto text-center">
              <p className="font-sans text-xs tracking-[0.4em] uppercase mb-4 font-semibold" style={{ color: '#D4A853' }}>
                Now That You Know the Story
              </p>
              <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#1A0812' }}>
                Explore the Collection
              </h2>
              <p className="font-sans text-sm mb-8 leading-relaxed" style={{ color: '#6B7280' }}>
                Every product you see carries a craft tradition, a skilled artisan, and an intention. Shop knowing your choice supports all of that.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-sans font-semibold"
                  style={{ background: 'linear-gradient(135deg, #1E0812 0%, #2E1428 100%)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>
                  Shop All Handcrafted Gifts
                </Link>
                <Link to="/gift-finder" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-sans font-semibold"
                  style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}>
                  Find the Perfect Gift
                </Link>
              </div>
            </div>
          </FadeSection>
        </section>
      </div>
    </>
  );
}

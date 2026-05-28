import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';

const PAGE_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': 'https://www.elunoracrafts.com/gifting-guide#article',
    'headline': 'The Ultimate Personalised Gifting Guide — How to Choose a Gift That Truly Matters',
    'description': 'A comprehensive guide to choosing meaningful, personalised, luxury handcrafted gifts for every occasion — birthdays, weddings, festivals, corporate gifting, and more.',
    'url': 'https://www.elunoracrafts.com/gifting-guide',
    'author': { '@type': 'Organization', 'name': 'ELUNORA' },
    'publisher': { '@id': 'https://www.elunoracrafts.com/#organization' },
    'about': [
      { '@type': 'Thing', 'name': 'Personalised gifting' },
      { '@type': 'Thing', 'name': 'Luxury gifts India' },
      { '@type': 'Thing', 'name': 'Handcrafted gifts guide' },
    ],
    'keywords': 'personalised gift guide, luxury gifting India, handmade gifts occasions, best gifts for birthday, corporate gifting guide, wedding gift ideas India',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Choose a Meaningful Personalised Gift',
    'description': 'A step-by-step guide to selecting the perfect personalised, handcrafted gift for any occasion.',
    'step': [
      { '@type': 'HowToStep', 'position': 1, 'name': 'Define the occasion and emotion', 'text': 'Clarify what you want the gift to communicate — celebration, love, gratitude, encouragement. The emotion guides the selection.' },
      { '@type': 'HowToStep', 'position': 2, 'name': 'Know the recipient deeply', 'text': 'Consider their personality, lifestyle, favourite colours, interests, and relationship to you. Personalisation works best when it reflects them, not you.' },
      { '@type': 'HowToStep', 'position': 3, 'name': 'Set a meaningful budget', 'text': 'The best gift is not always the most expensive. A ₹999 personalised candle with their name can be more powerful than a generic ₹5,000 hamper.' },
      { '@type': 'HowToStep', 'position': 4, 'name': 'Choose a product category', 'text': 'Match product type to their lifestyle — décor, consumables (candles, scents), wearables, or keepsakes.' },
      { '@type': 'HowToStep', 'position': 5, 'name': 'Add personalisation with intent', 'text': 'Choose a message, name, or date that will carry meaning years later. Avoid generic phrases. Specificity is what makes a gift unforgettable.' },
      { '@type': 'HowToStep', 'position': 6, 'name': 'Plan your delivery timeline', 'text': 'Order personalised gifts at least 7–10 days before the occasion. Express options are available but standard gives best quality control.' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Gifting Guide', 'item': 'https://www.elunoracrafts.com/gifting-guide' },
    ],
  },
];

const OCCASIONS = [
  {
    title: 'Birthdays',
    emoji: '🎂',
    color: '#F9C090',
    guide: 'The best birthday gift feels personal and specific — not like it could\'ve gone to anyone. For a close friend: personalised jewellery box, custom name candle, or a clay nameplate. For a colleague: curated desk hamper. For a parent: personalised keepsake or luxury candle with a favourite scent.',
    topGifts: ['Personalised Name Candle', 'Custom Clay Nameplate', 'Luxury Birthday Hamper', 'Personalised Photo Frame'],
    link: '/category/personalized-gifts',
  },
  {
    title: 'Weddings & Anniversaries',
    emoji: '💍',
    color: '#FFD700',
    guide: 'Wedding gifts should be lasting. Avoid cash-equivalent gifts that feel transactional. A handcrafted clay sculpture of their home, a personalised couple candle set, or a luxury hamper for their first morning together creates a memory that outlasts any appliance.',
    topGifts: ['Couple Personalised Candles', 'Handcrafted Clay Home Sculpture', 'Wedding Luxury Hamper', 'Personalised Keepsake Box'],
    link: '/category/wedding-collections',
  },
  {
    title: 'Festivals (Diwali, Holi, Eid)',
    emoji: '🪔',
    color: '#D4A853',
    guide: 'Festival gifting in India is about warmth, abundance, and cultural resonance. Go beyond the standard dry fruit box. Premium handmade diyas, fragrance candle sets, artisan clay art, and curated festival hampers elevate your gesture from obligation to celebration.',
    topGifts: ['Festival Diya Collection', 'Fragrance Candle Gift Set', 'Artisan Clay Festive Art', 'Premium Festival Hamper'],
    link: '/category/festival-collections',
  },
  {
    title: 'Corporate Gifting',
    emoji: '💼',
    color: '#C8A8FF',
    guide: 'Corporate gifts must balance professionalism with warmth. The best ones feel premium but not ostentatious, personal but not intrusive. Luxury candle sets, branded hampers, and artisan desk décor make a strong impression. For bulk orders with custom branding, contact us directly.',
    topGifts: ['Luxury Desk Hamper', 'Branded Candle Sets', 'Premium Gift Box (Bulk)', 'Artisan Clay Décor'],
    link: '/category/corporate-gifting',
  },
  {
    title: 'House Warming',
    emoji: '🏡',
    color: '#90F4C0',
    guide: 'Home décor gifts work best when they fit diverse taste — elegant neutrals, meaningful symbols, and practical beauty. Handcrafted clay art, artisan candles, woven baskets, and personalised door nameplates all communicate warmth for a new home.',
    topGifts: ['Clay Home Art', 'Personalised Nameplate', 'Artisan Candle Collection', 'Home Décor Hamper'],
    link: '/category/home-decor',
  },
  {
    title: 'Long-Distance Gifting',
    emoji: '📦',
    color: '#C4607A',
    guide: 'When distance separates you, a physical gift carries your presence. Choose something that stays — a personalised photo frame, a custom candle with "your favourite" scent, or a keepsake box engraved with a meaningful message. Include a handwritten note at checkout.',
    topGifts: ['Personalised Keepsake', 'Custom Scented Candle', 'Photo Frame with Message', 'Surprise Hamper'],
    link: '/products',
  },
];

const GUIDE_STEPS = [
  { n: '01', title: 'Define the occasion & emotion', body: 'What do you want the gift to say? Celebration, love, gratitude, encouragement, welcome? The emotion narrows the search immediately.' },
  { n: '02', title: 'Know the recipient deeply', body: 'Personality, lifestyle, taste in aesthetics, interests. Gifts that reflect the recipient — not the giver — hit differently. Think: what would make them smile specifically?' },
  { n: '03', title: 'Set a meaningful budget', body: 'A ₹999 personalised candle with their name and a specific message can be more powerful than a generic ₹5,000 hamper. Budget smartly — spend on personalisation, not just product cost.' },
  { n: '04', title: 'Choose the product category', body: 'Consumables (candles, hampers) for those who prefer experiences. Keepsakes (clay art, frames) for those who value permanence. Décor for home lovers. Match to lifestyle.' },
  { n: '05', title: 'Add personalisation with intent', body: 'Avoid generic phrases ("Happy Birthday!"). Be specific — a date that matters, an inside joke, a quote they love, a nickname. Specificity is what makes a gift unforgettable.' },
  { n: '06', title: 'Plan your timeline', body: 'Order personalised gifts 7–10 days before the occasion. Our standard personalisation lead time is 2–3 business days before dispatch. Express options available.' },
];

const FAQ_ITEMS = [
  {
    q: 'What makes a gift "personalised" vs just "custom"?',
    a: 'A personalised gift carries something specific to the recipient — their name, a date that matters to them, a message only they would understand. A custom gift is uniquely made but may not carry that personal signature. ELUNORA offers both, but the most powerful gifts are deeply personalised.',
  },
  {
    q: 'What is the best gift for someone who "has everything"?',
    a: 'An experience-led gift or a deeply personal keepsake. People who have everything usually still want to feel seen. A personalised handcrafted piece — something made specifically for them — carries that signal more than any product they could buy themselves.',
  },
  {
    q: 'How early should I order a personalised gift?',
    a: 'At least 7–10 days before your deadline. Our personalised items take 2–3 business days to craft before dispatch, plus delivery time (3–7 days depending on your city). For same-city same-day needs, contact us — we sometimes have capacity for emergency orders.',
  },
  {
    q: 'Is handmade really better than store-bought?',
    a: 'For gifting, yes — handmade carries intrinsic meaning. It signals that you chose something made with care, that you support a real artisan, and that the recipient received something truly one of a kind. Mass-produced gifts are interchangeable. Handmade gifts are not.',
  },
  {
    q: 'What budget should I set for a premium gift?',
    a: 'ELUNORA has options from ₹499 to ₹15,000+. For a heartfelt personal gift, ₹999–₹2,499 is the sweet spot. For luxury hampers or corporate gifting, ₹2,500–₹10,000 is common. The most important factor is personalisation — a ₹999 gift with a perfect message beats a ₹4,999 generic one.',
  },
];

const FAQ_SCHEMA_EXTRA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    'name': item.q,
    'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
  })),
};

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export default function GiftingGuidePage() {
  return (
    <>
      <SEOHead
        title="The Ultimate Gifting Guide — How to Choose a Meaningful Gift | ELUNORA"
        description="ELUNORA's comprehensive guide to personalised, handcrafted gifting. Birthday gifts, wedding gifts, corporate gifting, festival collections — expert advice for every occasion."
        keywords="gifting guide India, personalised gift ideas, how to choose a gift, luxury gifts India, birthday gifts, wedding gifts India, corporate gifting guide, handmade gifts occasions"
        schema={[...PAGE_SCHEMA, FAQ_SCHEMA_EXTRA] as any}
      />

      <div className="min-h-screen overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative py-28 px-4 text-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #080208 0%, #1E0812 55%, #2E1428 100%)' }}>
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #D4A853 0%, transparent 60%)' }} />
          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full text-xs font-sans tracking-widest uppercase"
              style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)', color: '#D4A853' }}>
              ✦ Expert Gifting Guide ✦
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="font-serif text-white mb-5"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              The Art of Giving Something<br />
              <em style={{ color: '#D4A853', fontStyle: 'italic' }}>That Truly Matters</em>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="font-sans max-w-xl mx-auto leading-relaxed"
              style={{ color: '#8A6070', fontSize: '1rem' }}>
              A comprehensive guide to choosing meaningful, personalised, handcrafted gifts — for every occasion, every budget, and every person you love.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3 justify-center mt-8">
              {['Birthdays', 'Weddings', 'Festivals', 'Corporate', 'Housewarming', 'Long-Distance'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full font-sans text-xs"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#C4A0B0' }}>
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── How to Choose ── */}
        <section className="py-20 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <div className="text-center mb-14">
                <p className="font-sans text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>
                  Step-by-Step
                </p>
                <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#1A0812' }}>
                  How to Choose a Gift That Lands
                </h2>
                <p className="font-sans text-sm max-w-xl mx-auto" style={{ color: '#6B7280' }}>
                  Most bad gifts happen when people shop for the product before thinking about the person.
                </p>
              </div>
            </FadeSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {GUIDE_STEPS.map((step, i) => (
                <FadeSection key={step.n} delay={i * 0.07}>
                  <div className="p-6 rounded-2xl h-full" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs mb-4"
                      style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>
                      {step.n}
                    </div>
                    <h3 className="font-sans font-semibold text-sm mb-2" style={{ color: '#1A1A1A' }}>{step.title}</h3>
                    <p className="font-sans text-xs leading-relaxed" style={{ color: '#6B7280' }}>{step.body}</p>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── By Occasion ── */}
        <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #1A0812 0%, #080208 100%)' }}>
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <div className="text-center mb-14">
                <p className="font-sans text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>
                  Gifting by Occasion
                </p>
                <h2 className="font-serif text-white" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
                  Every Occasion Deserves Its Own Gift
                </h2>
              </div>
            </FadeSection>
            <div className="space-y-5">
              {OCCASIONS.map((occ, i) => (
                <FadeSection key={occ.title} delay={i * 0.06}>
                  <div className="grid md:grid-cols-3 gap-6 p-6 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-3">
                        <span style={{ fontSize: '1.8rem' }}>{occ.emoji}</span>
                        <h3 className="font-serif text-xl" style={{ color: occ.color }}>{occ.title}</h3>
                      </div>
                      <p className="font-sans text-sm leading-relaxed" style={{ color: '#8A6070' }}>{occ.guide}</p>
                    </div>
                    <div>
                      <p className="font-sans text-xs tracking-widest uppercase mb-3 font-semibold" style={{ color: '#5A3040' }}>
                        Top Picks
                      </p>
                      <ul className="space-y-1.5 mb-4">
                        {occ.topGifts.map((g) => (
                          <li key={g} className="flex items-center gap-2 font-sans text-xs" style={{ color: '#C4A0B0' }}>
                            <span style={{ color: occ.color }}>✦</span> {g}
                          </li>
                        ))}
                      </ul>
                      <Link to={occ.link}
                        className="inline-block px-4 py-2 rounded-lg text-xs font-sans font-semibold"
                        style={{ background: `${occ.color}15`, color: occ.color, border: `1px solid ${occ.color}30` }}>
                        Shop {occ.title} →
                      </Link>
                    </div>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gift by Budget ── */}
        <section className="py-20 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-5xl mx-auto">
            <FadeSection>
              <div className="text-center mb-12">
                <p className="font-sans text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>Gift by Budget</p>
                <h2 className="font-serif mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#1A0812' }}>
                  Premium Gifts at Every Price Point
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { range: '₹499 – ₹999', label: 'Thoughtful', desc: 'Personalised candles, custom keychains, small clay pieces. Perfect for colleagues, classmates, and casual gifting.', color: '#6B7280' },
                  { range: '₹1,000 – ₹2,499', label: 'Heartfelt', desc: 'Personalised gift sets, clay art, curated duo hampers. The sweet spot for close friends and family.', color: '#059669' },
                  { range: '₹2,500 – ₹4,999', label: 'Premium', desc: 'Luxury hampers, personalised art pieces, bespoke candle sets. Ideal for milestones and important people.', color: '#D4A853' },
                  { range: '₹5,000+', label: 'Luxury', desc: 'Grand hampers, commissioned keepsakes, corporate bulk orders. For the most special occasions and premium brand impressions.', color: '#C4607A' },
                ].map(({ range, label, desc, color }) => (
                  <div key={range} className="p-5 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <p className="font-sans font-bold text-lg mb-0.5" style={{ color }}>{range}</p>
                    <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF' }}>{label}</p>
                    <p className="font-sans text-xs leading-relaxed" style={{ color: '#6B7280' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ── Why Handmade ── */}
        <section className="py-20 px-4" style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 100%)' }}>
          <div className="max-w-4xl mx-auto">
            <FadeSection>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <p className="font-sans text-xs tracking-[0.4em] uppercase mb-4 font-semibold" style={{ color: '#D4A853' }}>
                    Why Handmade?
                  </p>
                  <h2 className="font-serif text-white mb-6" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
                    The Difference Between a Gift and a Gesture
                  </h2>
                  <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: '#8A6070' }}>
                    Mass-produced gifts communicate efficiency. Handmade gifts communicate that you paused — that you thought about the person, chose something made by human hands, and cared enough to invest in quality over convenience.
                  </p>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: '#8A6070' }}>
                    When you give an ELUNORA gift, you are giving something an artisan spent hours on. Something that carries the energy of its creation. Something the recipient cannot get anywhere else.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { stat: '91%', label: 'of recipients say personalised gifts feel more meaningful than generic ones' },
                    { stat: '3×', label: 'more likely to be kept and displayed vs mass-produced gifts' },
                    { stat: '78%', label: 'of people remember a handmade gift they received years later' },
                  ].map(({ stat, label }) => (
                    <div key={stat} className="flex items-start gap-4 p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,83,0.12)' }}>
                      <p className="font-serif text-3xl flex-shrink-0" style={{ color: '#D4A853' }}>{stat}</p>
                      <p className="font-sans text-xs leading-relaxed mt-1" style={{ color: '#8A6070' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 px-4" style={{ background: '#FAFAF8' }}>
          <div className="max-w-3xl mx-auto">
            <FadeSection>
              <div className="text-center mb-12">
                <p className="font-sans text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>Common Questions</p>
                <h2 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#1A0812' }}>Gifting FAQs</h2>
              </div>
              <div className="space-y-4">
                {FAQ_ITEMS.map(({ q, a }) => (
                  <div key={q} className="p-6 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <h3 className="font-sans font-semibold text-sm mb-2" style={{ color: '#1A1A1A' }}>{q}</h3>
                    <p className="font-sans text-sm leading-relaxed" style={{ color: '#6B7280' }}>{a}</p>
                  </div>
                ))}
              </div>
            </FadeSection>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-4" style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 100%)' }}>
          <FadeSection>
            <div className="max-w-2xl mx-auto text-center">
              <p className="font-sans text-xs tracking-[0.4em] uppercase mb-4 font-semibold" style={{ color: '#D4A853' }}>
                Ready to Gift?
              </p>
              <h2 className="font-serif text-white mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
                Find Your Perfect Gift Now
              </h2>
              <p className="font-sans text-sm mb-8" style={{ color: '#8A6070' }}>
                Use our Gift Finder to get personalised recommendations in 60 seconds — or browse collections by occasion.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/gift-finder"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-sans font-semibold"
                  style={{ background: '#D4A853', color: '#1A0812' }}>
                  Use Gift Finder →
                </Link>
                <Link to="/products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-sans font-semibold"
                  style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}>
                  Shop All Gifts
                </Link>
              </div>
            </div>
          </FadeSection>
        </section>
      </div>
    </>
  );
}

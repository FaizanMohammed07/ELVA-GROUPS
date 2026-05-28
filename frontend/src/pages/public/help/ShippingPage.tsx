import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, Package, Shield, RefreshCw } from 'lucide-react';
import { SEOHead } from '@components/seo/SEOHead';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' },
    { '@type': 'ListItem', 'position': 2, 'name': 'Help', 'item': 'https://www.elunoracrafts.com/help/faq' },
    { '@type': 'ListItem', 'position': 3, 'name': 'Shipping & Delivery', 'item': 'https://www.elunoracrafts.com/help/shipping' },
  ],
};

const ZONES = [
  { zone: 'Metro Cities', cities: 'Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata', standard: '3–5 days', express: '1–2 days' },
  { zone: 'Tier-1 Cities', cities: 'Ahmedabad, Surat, Jaipur, Lucknow, Kochi, Chandigarh, Indore', standard: '4–6 days', express: '2–3 days' },
  { zone: 'Tier-2 / Tier-3 Cities', cities: 'All other serviceable pin codes', standard: '5–8 days', express: '3–4 days' },
  { zone: 'Remote Areas', cities: 'Hilly terrain, islands, border regions', standard: '8–12 days', express: 'Not available' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Shipping ₹999+', body: 'Complimentary standard shipping on all orders above ₹999. No code needed — applied automatically.' },
  { icon: Clock, title: 'Personalised Lead Time', body: 'Personalised items require 2–3 additional business days for crafting before dispatch.' },
  { icon: Package, title: 'Signature Packaging', body: 'All orders arrive in ELUNORA\'s premium gift boxes — textured, ribbon-tied, with optional handwritten note.' },
  { icon: MapPin, title: 'Real-Time Tracking', body: 'Track your order in real-time via email, SMS, and your ELUNORA account after dispatch.' },
  { icon: Shield, title: 'Insured Delivery', body: 'Every order is insured during transit. Damaged or lost orders are replaced at no cost to you.' },
  { icon: RefreshCw, title: 'Easy Returns', body: 'Not happy? Return non-personalised items within 7 days of delivery. No questions asked.' },
];

export default function ShippingPage() {
  return (
    <>
      <SEOHead
        title="Shipping & Delivery Policy | ELUNORA"
        description="ELUNORA ships pan-India. Free shipping on orders ₹999+. Standard delivery 5–7 days, express 2–3 days. Tracking, insurance, and premium packaging on every order."
        keywords="ELUNORA shipping, delivery time India, free shipping handmade gifts, order tracking ELUNORA"
        schema={BREADCRUMB_SCHEMA}
      />

      <div className="min-h-screen pt-24 pb-20" style={{ background: '#FAFAF8' }}>

        {/* Hero */}
        <section className="py-14 px-4 text-center" style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 100%)' }}>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="font-sans text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#D4A853' }}>
            Help Centre
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="font-serif text-4xl md:text-5xl text-white mb-4">
            Shipping & Delivery
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="font-sans text-sm max-w-md mx-auto" style={{ color: '#8A6070' }}>
            Pan-India delivery with premium packaging, real-time tracking, and full insurance on every order.
          </motion.p>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="p-5 rounded-xl" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)' }}>
                  <Icon size={16} style={{ color: '#D4A853' }} />
                </div>
                <h3 className="font-sans font-semibold text-sm mb-1.5" style={{ color: '#1A1A1A' }}>{title}</h3>
                <p className="font-sans text-xs leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
              </motion.div>
            ))}
          </div>

          {/* Delivery timeline */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl mb-2" style={{ color: '#1A0812' }}>Delivery Timelines</h2>
            <p className="font-sans text-sm mb-6" style={{ color: '#6B7280' }}>
              Timelines are counted in business days (Monday–Saturday, excluding public holidays) and begin from dispatch, not order placement.
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr style={{ background: '#1E0812' }}>
                    <th className="text-left py-4 px-5 font-semibold text-xs tracking-wide uppercase" style={{ color: '#D4A853' }}>Zone</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs tracking-wide uppercase hidden sm:table-cell" style={{ color: '#D4A853' }}>Cities</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs tracking-wide uppercase" style={{ color: '#D4A853' }}>Standard</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs tracking-wide uppercase" style={{ color: '#D4A853' }}>Express</th>
                  </tr>
                </thead>
                <tbody>
                  {ZONES.map((row, i) => (
                    <tr key={row.zone} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <td className="py-4 px-5 font-medium" style={{ color: '#1A1A1A' }}>{row.zone}</td>
                      <td className="py-4 px-5 hidden sm:table-cell" style={{ color: '#6B7280' }}>{row.cities}</td>
                      <td className="py-4 px-5 font-semibold" style={{ color: '#059669' }}>{row.standard}</td>
                      <td className="py-4 px-5" style={{ color: row.express === 'Not available' ? '#9CA3AF' : '#D97706' }}>{row.express}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-sans text-xs mt-3" style={{ color: '#9CA3AF' }}>
              * Express delivery is charged separately at checkout based on location and order weight.
            </p>
          </section>

          {/* Personalised orders note */}
          <section className="mb-16 rounded-xl p-6" style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.2)' }}>
            <h2 className="font-sans font-semibold mb-2" style={{ color: '#D4A853' }}>⚠ Personalised Orders — Important Note</h2>
            <p className="font-sans text-sm leading-relaxed" style={{ color: '#4B3040' }}>
              Personalised products (with custom names, messages, dates, or designs) require <strong>2–3 additional business days</strong> for crafting and quality-check before dispatch. The estimated delivery date shown on the product page already includes this lead time. If you need your order urgently, please contact us before placing — we sometimes offer expedited personalisation.
            </p>
          </section>

          {/* Packaging */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl mb-4" style={{ color: '#1A0812' }}>Signature Packaging</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: '#4B5563' }}>
                  Every ELUNORA order arrives dressed to impress. Our packaging is part of the gift experience — not an afterthought.
                </p>
                <ul className="space-y-2 font-sans text-sm" style={{ color: '#4B5563' }}>
                  {[
                    'Premium textured gift box with magnetic closure',
                    'Hand-wrapped in tissue with ELUNORA seal',
                    'Satin ribbon in signature blush or gold',
                    'Optional handwritten message card (add at checkout)',
                    'Fragrance sachet for a luxury unboxing experience',
                    'Recyclable and eco-conscious materials',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span style={{ color: '#D4A853' }}>✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl aspect-[4/3]" style={{ background: 'linear-gradient(135deg, #2E1428 0%, #1A0812 100%)', border: '1px solid rgba(212,168,83,0.15)' }}>
                <div className="h-full flex items-center justify-center">
                  <p className="font-serif text-3xl text-white opacity-30">ELUNORA</p>
                </div>
              </div>
            </div>
          </section>

          {/* Policy details */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl mb-6" style={{ color: '#1A0812' }}>Shipping Policy Details</h2>
            {[
              { title: 'Order Cut-off Time', body: 'Orders placed before 2:00 PM IST on business days are dispatched the same day. Orders placed after 2:00 PM are dispatched the next business day.' },
              { title: 'Courier Partners', body: 'We ship via BlueDart, Delhivery, DTDC, and Shiprocket-partner networks depending on your location and service level. Tracking details are shared via email and SMS.' },
              { title: 'What if I miss my delivery?', body: 'Courier partners attempt delivery 3 times. After 3 failed attempts, the package returns to us. We will contact you to reattempt. If undeliverable, we can reshiup at a nominal charge or issue a store credit.' },
              { title: 'PO Boxes & Remote Addresses', body: 'We cannot deliver to PO boxes. For remote or difficult-to-access locations, standard timelines may extend. Please ensure your address includes a landmark or complete details.' },
            ].map(({ title, body }) => (
              <div key={title} className="mb-5 pb-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 className="font-sans font-semibold text-sm mb-1.5" style={{ color: '#1A1A1A' }}>{title}</h3>
                <p className="font-sans text-sm leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
              </div>
            ))}
          </section>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            <Link to="/help/returns" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans font-semibold"
              style={{ background: '#1E0812', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>
              Returns & Exchange Policy →
            </Link>
            <Link to="/help/faq" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans"
              style={{ background: 'white', color: '#6B7280', border: '1px solid rgba(0,0,0,0.1)' }}>
              View All FAQ
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans"
              style={{ background: 'white', color: '#6B7280', border: '1px solid rgba(0,0,0,0.1)' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

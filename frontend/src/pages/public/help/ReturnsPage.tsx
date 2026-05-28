import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { SEOHead } from '@components/seo/SEOHead';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' },
    { '@type': 'ListItem', 'position': 2, 'name': 'Help', 'item': 'https://www.elunoracrafts.com/help/faq' },
    { '@type': 'ListItem', 'position': 3, 'name': 'Returns & Exchange', 'item': 'https://www.elunoracrafts.com/help/returns' },
  ],
};

const RETURN_STEPS = [
  { step: '01', title: 'Initiate Request', body: 'Log into your ELUNORA account → My Orders → select the order → click "Return / Exchange". Or email hello@elunoracrafts.com with your order number and reason.' },
  { step: '02', title: 'Get Approval', body: 'Our team reviews your request within 24 hours and confirms eligibility. We\'ll also clarify whether a return, exchange, or refund is the best resolution.' },
  { step: '03', title: 'Reverse Pickup', body: 'Once approved, a courier partner will collect the item from your address within 2–3 business days. Keep the item in original packaging with tags intact.' },
  { step: '04', title: 'Quality Check', body: 'On receiving the item, our quality team inspects it within 24 hours. You\'ll receive a confirmation email with the outcome.' },
  { step: '05', title: 'Refund / Exchange', body: 'Refunds are processed within 5–7 business days to your original payment method. Exchanges are dispatched after QC clearance.' },
];

const ELIGIBLE = [
  'Items in original, unused condition with all tags and packaging',
  'Non-personalised, standard products',
  'Items returned within 7 days of delivery',
  'Damaged or defective items (any timeline)',
  'Wrong item received',
];

const NOT_ELIGIBLE = [
  'Personalised or customised products (name, message, design)',
  'Items damaged due to misuse or improper care',
  'Products without original packaging',
  'Items returned after 7 days (except defective)',
  'Perishable items or consumables once opened',
];

export default function ReturnsPage() {
  return (
    <>
      <SEOHead
        title="Returns & Exchange Policy | ELUNORA"
        description="ELUNORA offers a 7-day hassle-free return policy on non-personalised items. Learn how to initiate a return, exchange, or refund. Fast, fair, and simple."
        keywords="ELUNORA returns, exchange policy, refund policy, return handmade gift, 7 day return India"
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
            Returns & Exchange
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="font-sans text-sm max-w-md mx-auto" style={{ color: '#8A6070' }}>
            7-day hassle-free returns on non-personalised items. Your satisfaction is our guarantee.
          </motion.p>

          {/* Quick stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { icon: Clock, label: '7-day return window' },
              { icon: RefreshCw, label: 'Free reverse pickup' },
              { icon: CheckCircle, label: 'Refund in 5–7 days' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={14} style={{ color: '#D4A853' }} />
                <span className="font-sans text-xs" style={{ color: '#C4A0B0' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

          {/* Eligibility */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl mb-6" style={{ color: '#1A0812' }}>What Can Be Returned?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl p-6" style={{ background: 'white', border: '1px solid rgba(5,150,105,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={16} style={{ color: '#059669' }} />
                  <h3 className="font-sans font-semibold text-sm" style={{ color: '#059669' }}>Eligible for Return</h3>
                </div>
                <ul className="space-y-2.5">
                  {ELIGIBLE.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-sans text-sm" style={{ color: '#374151' }}>
                      <span className="mt-0.5 flex-shrink-0" style={{ color: '#059669' }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-6" style={{ background: 'white', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <XCircle size={16} style={{ color: '#DC2626' }} />
                  <h3 className="font-sans font-semibold text-sm" style={{ color: '#DC2626' }}>Not Eligible for Return</h3>
                </div>
                <ul className="space-y-2.5">
                  {NOT_ELIGIBLE.map((item) => (
                    <li key={item} className="flex items-start gap-2 font-sans text-sm" style={{ color: '#374151' }}>
                      <span className="mt-0.5 flex-shrink-0" style={{ color: '#DC2626' }}>✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl mb-2" style={{ color: '#1A0812' }}>How to Return — Step by Step</h2>
            <p className="font-sans text-sm mb-8" style={{ color: '#6B7280' }}>The entire process takes less than 10 minutes to initiate.</p>
            <div className="space-y-4">
              {RETURN_STEPS.map(({ step, title, body }) => (
                <motion.div key={step} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="flex gap-5 p-5 rounded-xl" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                    style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>
                    {step}
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-sm mb-1" style={{ color: '#1A1A1A' }}>{title}</h3>
                    <p className="font-sans text-sm leading-relaxed" style={{ color: '#6B7280' }}>{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Refund timelines */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl mb-6" style={{ color: '#1A0812' }}>Refund Timelines</h2>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr style={{ background: '#1E0812' }}>
                    <th className="text-left py-4 px-5 font-semibold text-xs tracking-wide uppercase" style={{ color: '#D4A853' }}>Payment Method</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs tracking-wide uppercase" style={{ color: '#D4A853' }}>Refund Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { method: 'UPI (PhonePe, Google Pay, Paytm)', timeline: '3–5 business days' },
                    { method: 'Credit / Debit Card', timeline: '5–7 business days' },
                    { method: 'Net Banking', timeline: '5–7 business days' },
                    { method: 'EMI (via Razorpay)', timeline: '7–10 business days (per bank policy)' },
                    { method: 'ELUNORA Store Credit', timeline: 'Instant (if opted for store credit)' },
                  ].map((row, i) => (
                    <tr key={row.method} style={{ background: i % 2 === 0 ? 'white' : '#FAFAF8', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <td className="py-4 px-5 font-medium" style={{ color: '#1A1A1A' }}>{row.method}</td>
                      <td className="py-4 px-5" style={{ color: '#6B7280' }}>{row.timeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="font-sans text-xs mt-3" style={{ color: '#9CA3AF' }}>
              Timelines begin after ELUNORA confirms the returned item has passed quality check.
            </p>
          </section>

          {/* Damaged item */}
          <section className="mb-12 rounded-xl p-6" style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.2)' }}>
            <h2 className="font-sans font-semibold mb-2" style={{ color: '#D4A853' }}>📸 Received a Damaged Item?</h2>
            <p className="font-sans text-sm leading-relaxed mb-3" style={{ color: '#4B3040' }}>
              Despite our premium packaging, transit damage can occasionally occur. If your order arrives damaged:
            </p>
            <ol className="space-y-1 font-sans text-sm" style={{ color: '#4B3040' }}>
              {[
                'Photograph the damaged item and packaging immediately',
                'Email the photos to hello@elunoracrafts.com with your order number',
                'Do this within 48 hours of delivery',
                'We will dispatch a replacement within 24 hours of confirmation — no return shipping needed',
              ].map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-semibold" style={{ color: '#D4A853' }}>{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            <Link to="/help/shipping" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans font-semibold"
              style={{ background: '#1E0812', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>
              Shipping Policy →
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

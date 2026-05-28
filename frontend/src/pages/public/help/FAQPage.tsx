import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';

const FAQ_SECTIONS = [
  {
    id: 'orders',
    label: 'Orders & Shipping',
    emoji: '📦',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery across India takes 5–7 business days. Express delivery (2–3 business days) is available at checkout for an additional charge. Metro cities like Mumbai, Delhi, Bangalore, Chennai, Hyderabad, and Pune typically receive orders faster.',
      },
      {
        q: 'Is shipping free?',
        a: 'Yes! We offer free standard shipping on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹79 applies.',
      },
      {
        q: 'Do you ship pan-India?',
        a: 'We deliver to 500+ cities and towns across India. If your pin code is not serviceable, we will notify you at checkout. International shipping is coming soon.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order is dispatched, you will receive an email and SMS with your tracking number and courier partner details. You can also track your order from your ELUNORA account under "My Orders".',
      },
      {
        q: 'Can I change my delivery address after placing an order?',
        a: 'Address changes are possible within 2 hours of placing the order. After that, the order enters production or packaging. Contact us immediately at hello@elunoracrafts.com or WhatsApp us.',
      },
      {
        q: 'What if my order arrives damaged?',
        a: 'We package every order with care, but if something arrives damaged, please photograph it and contact us within 48 hours of delivery at hello@elunoracrafts.com. We will send a replacement at no extra cost.',
      },
    ],
  },
  {
    id: 'products',
    label: 'Products & Personalisation',
    emoji: '🎁',
    items: [
      {
        q: 'Are all ELUNORA products truly handmade?',
        a: 'Yes, every product sold on ELUNORA is handcrafted by skilled Indian artisans. We do not stock mass-produced items. Each piece carries slight variations in texture, colour, or finish — these are not defects but proof of authentic handcraftsmanship.',
      },
      {
        q: 'How do I personalise a product?',
        a: 'On any product page, select your personalisation options — name, message, date, initials, or custom design. Fill in the personalisation field and add to cart. Our artisans craft your custom order within 24–48 hours of confirmation.',
      },
      {
        q: 'What is the lead time for personalised orders?',
        a: 'Personalised products require an additional 2–3 business days for crafting before dispatch. The product page shows the expected delivery date including personalisation time. For urgent gifting needs, use the express option or contact us.',
      },
      {
        q: 'Can I see product photos before personalisation?',
        a: 'Yes, each product page shows multiple high-resolution photos. For customised text or design preview, contact us via WhatsApp and our team will share a digital mock-up before production begins.',
      },
      {
        q: 'Do you offer gift wrapping?',
        a: 'All ELUNORA orders come in our signature premium packaging — textured boxes, tissue wrap, satin ribbon, and a handwritten note option. Giftwrapping is complimentary. You can also add a custom message at checkout.',
      },
      {
        q: 'What is a Custom Order?',
        a: 'Custom Orders allow you to commission completely bespoke pieces — unique designs, bulk orders, or corporate gifting programs. Submit your requirements via the Custom Order page and our team will respond within 24 hours with a quote and timeline.',
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments & Pricing',
    emoji: '💳',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major UPI apps (PhonePe, Google Pay, Paytm), credit/debit cards (Visa, Mastercard, Rupay), net banking, and EMI on select cards via Razorpay. All transactions are 100% secure and encrypted.',
      },
      {
        q: 'Are there any hidden charges?',
        a: 'No hidden charges. The price you see on the product page is what you pay, plus applicable shipping (free above ₹999). GST is included in the displayed price.',
      },
      {
        q: 'Do you offer discounts or coupon codes?',
        a: 'Yes! Use ELUNORA10 for 10% off your first order. Subscribe to our newsletter for exclusive offers, seasonal discounts, and early access to new collections. Bulk and corporate orders receive special pricing — contact us.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Completely. We use Razorpay, India\'s most trusted payment gateway, which is PCI-DSS compliant. ELUNORA does not store your card details. All transactions are SSL-encrypted.',
      },
    ],
  },
  {
    id: 'returns',
    label: 'Returns & Exchanges',
    emoji: '🔄',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day return policy for non-personalised items. Items must be unused, in original packaging, and in the same condition received. Personalised or custom items are non-returnable unless defective.',
      },
      {
        q: 'How do I initiate a return or exchange?',
        a: 'Log into your ELUNORA account, go to My Orders, select the order, and click "Request Return". Alternatively, email hello@elunoracrafts.com with your order number. Our team will arrange a reverse pickup within 2 business days.',
      },
      {
        q: 'When will I get my refund?',
        a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item. The amount is credited to your original payment method. For UPI/bank transfers, allow 3–5 additional banking days.',
      },
      {
        q: 'What if I received a wrong item?',
        a: 'We apologise for the error. Please email us at hello@elunoracrafts.com with your order number and a photo of the item received. We will dispatch the correct item immediately at our cost.',
      },
    ],
  },
  {
    id: 'about',
    label: 'About ELUNORA',
    emoji: '✨',
    items: [
      {
        q: 'What is ELUNORA?',
        a: 'ELUNORA is India\'s premium handcrafted gifting and lifestyle brand. We curate and sell artisan-made products — personalised gifts, luxury candles, clay art, hampers, and home décor — crafted by skilled Indian artisans. Every product tells a story.',
      },
      {
        q: 'Who is behind ELUNORA?',
        a: 'ELUNORA is backed and incubated by DEVUP Ecosystem — a developer society and startup incubator at VJIT (Vivekanand Institute of Technology). The brand was built by a team of young entrepreneurs who believe technology and craftsmanship should coexist beautifully.',
      },
      {
        q: 'Do you work directly with artisans?',
        a: 'Yes. We partner directly with artisans and small craft communities across India. No middlemen. Our artisan partners receive fair compensation, skill development support, and a platform to reach customers nationwide.',
      },
      {
        q: 'Is ELUNORA committed to sustainability?',
        a: 'Deeply. We use natural materials — soy wax, beeswax, clay, recycled papers — wherever possible. Our packaging is recyclable or biodegradable. We are actively working toward a fully carbon-neutral supply chain by 2026.',
      },
      {
        q: 'How can I become an ELUNORA artisan partner?',
        a: 'We are always looking for talented artisans to collaborate with. If you create handmade products and want to reach customers across India, email us at artisans@elunoracrafts.com with your craft description and portfolio.',
      },
    ],
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': FAQ_SECTIONS.flatMap((s) =>
    s.items.map((item) => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
    }))
  ),
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' },
    { '@type': 'ListItem', 'position': 2, 'name': 'Help', 'item': 'https://www.elunoracrafts.com/help/faq' },
    { '@type': 'ListItem', 'position': 3, 'name': 'FAQ', 'item': 'https://www.elunoracrafts.com/help/faq' },
  ],
};

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b cursor-pointer"
      style={{ borderColor: 'rgba(212,168,83,0.15)' }}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-start justify-between gap-4 py-5">
        <h3 className="font-sans font-medium text-sm leading-relaxed pr-2" style={{ color: '#1A1A1A' }}>
          {q}
        </h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0 mt-0.5">
          <ChevronDown size={16} style={{ color: '#D4A853' }} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="font-sans text-sm leading-relaxed pb-5" style={{ color: '#6B7280' }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState('orders');
  const [search, setSearch] = useState('');

  const filtered = FAQ_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter(
      (i) =>
        !search ||
        i.q.toLowerCase().includes(search.toLowerCase()) ||
        i.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  const current = search
    ? filtered
    : FAQ_SECTIONS.filter((s) => s.id === activeSection);

  return (
    <>
      <SEOHead
        title="FAQ — Frequently Asked Questions | ELUNORA"
        description="Find answers to common questions about ELUNORA — shipping, delivery, personalisation, returns, payments, and more. India's premium handcrafted gifting brand."
        keywords="ELUNORA FAQ, handcrafted gifts FAQ, shipping India, returns policy, personalised gifts India"
        schema={[FAQ_SCHEMA, BREADCRUMB_SCHEMA] as any}
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
            Frequently Asked Questions
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
            className="font-sans text-sm max-w-md mx-auto mb-8" style={{ color: '#8A6070' }}>
            Everything you need to know about gifting with ELUNORA.
          </motion.p>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="relative max-w-md mx-auto">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#8A6070' }} />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 text-sm font-sans rounded-lg focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(212,168,83,0.25)',
                color: '#F0D8E0',
              }}
            />
          </motion.div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-10">

            {/* Sidebar nav */}
            {!search && (
              <aside className="md:w-56 flex-shrink-0">
                <nav className="sticky top-28 space-y-1">
                  {FAQ_SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSection(s.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 font-sans text-sm"
                      style={{
                        background: activeSection === s.id ? 'rgba(212,168,83,0.1)' : 'transparent',
                        color: activeSection === s.id ? '#D4A853' : '#6B7280',
                        border: activeSection === s.id ? '1px solid rgba(212,168,83,0.2)' : '1px solid transparent',
                      }}
                    >
                      <span>{s.emoji}</span>
                      <span className="font-medium">{s.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Contact CTA */}
                <div className="mt-8 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #1E0812 0%, #2E1428 100%)', border: '1px solid rgba(212,168,83,0.15)' }}>
                  <p className="font-sans text-xs font-semibold mb-1" style={{ color: '#D4A853' }}>Still have questions?</p>
                  <p className="font-sans text-xs mb-3" style={{ color: '#8A6070' }}>Our team responds within 24 hours.</p>
                  <Link to="/contact" className="block text-center py-2 text-xs font-sans font-semibold rounded-lg"
                    style={{ background: 'rgba(212,168,83,0.15)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}>
                    Contact Us →
                  </Link>
                </div>
              </aside>
            )}

            {/* Questions */}
            <div className="flex-1 min-w-0">
              {search && filtered.length === 0 && (
                <div className="text-center py-16">
                  <p className="font-sans text-sm" style={{ color: '#9CA3AF' }}>No results for "{search}"</p>
                  <button onClick={() => setSearch('')} className="mt-3 text-xs font-sans underline" style={{ color: '#D4A853' }}>
                    Clear search
                  </button>
                </div>
              )}

              {(search ? filtered : current).map((section) => (
                <div key={section.id} className="mb-10">
                  {search && (
                    <p className="font-sans text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: '#D4A853' }}>
                      {section.emoji} {section.label}
                    </p>
                  )}
                  <div className="rounded-xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div className="px-6">
                      {section.items.map((item) => (
                        <AccordionItem key={item.q} q={item.q} a={item.a} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <section className="max-w-3xl mx-auto px-4 text-center mt-4 mb-8">
          <div className="rounded-2xl px-8 py-10" style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 100%)', border: '1px solid rgba(212,168,83,0.15)' }}>
            <p className="font-sans text-xs tracking-widest uppercase mb-3 font-semibold" style={{ color: '#D4A853' }}>Need more help?</p>
            <h2 className="font-serif text-2xl text-white mb-3">We're here for you</h2>
            <p className="font-sans text-sm mb-6" style={{ color: '#8A6070' }}>
              Email us at <a href="mailto:hello@elunoracrafts.com" style={{ color: '#D4A853' }}>hello@elunoracrafts.com</a> or WhatsApp us for instant support.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-sans font-semibold"
                style={{ background: '#D4A853', color: '#1A0812' }}>
                Contact Support
              </Link>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-sans font-semibold"
                style={{ background: 'rgba(212,168,83,0.1)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.25)' }}>
                WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: `By accessing or using the ELUNORA website (www.elunoracrafts.com) or placing an order, you confirm that you are at least 18 years of age (or have parental consent if under 18), have read and understood these Terms of Service, and agree to be legally bound by them.

If you do not agree to these Terms, please do not use our website or services.`,
  },
  {
    id: 'products',
    title: '2. Products & Descriptions',
    body: `ELUNORA sells handcrafted products made by skilled Indian artisans. Because every item is handmade:

• Slight variations in colour, texture, size, or finish are inherent to the handcrafted nature of our products and are not considered defects.
• Product images are representative. Colours may vary slightly from screen to actual product due to display settings.
• We reserve the right to modify product descriptions, pricing, or availability without prior notice.
• All products are subject to availability. In rare cases where an ordered item becomes unavailable, we will contact you within 24 hours to offer an alternative or full refund.`,
  },
  {
    id: 'ordering',
    title: '3. Orders & Contracts',
    body: `Placing an order constitutes an offer to purchase. A contract is formed when we send you an order confirmation email. We reserve the right to decline any order at our discretion (e.g., suspected fraud, unavailability, pricing errors).

Personalised orders are irrevocable once crafting has begun. Please review all personalisation details carefully before confirming your order.`,
  },
  {
    id: 'pricing',
    title: '4. Pricing & Payments',
    body: `• All prices are listed in Indian Rupees (₹) and include applicable GST.
• Prices are subject to change without notice. The price charged is the price displayed at the time of order confirmation.
• Payments are processed via Razorpay. By placing an order, you authorise the charge to your selected payment method.
• In the event of a pricing error, we will contact you before processing your order.
• EMI and BNPL options are subject to terms of the respective financial institutions.`,
  },
  {
    id: 'personalisation',
    title: '5. Personalised & Custom Orders',
    body: `For personalised products:

• You are responsible for ensuring accuracy of all personalisation text — names, dates, messages, and designs.
• We will produce items exactly as specified. We do not fact-check personalisation content.
• Personalised items cannot be returned or exchanged unless defective or incorrectly produced by us.
• Custom Order commissions are subject to separate quote agreements. Production begins only after advance payment and written approval of design mockup.
• ELUNORA reserves the right to decline personalisation requests that are offensive, unlawful, or infringe third-party rights.`,
  },
  {
    id: 'shipping-returns',
    title: '6. Shipping, Delivery & Returns',
    body: `Shipping, delivery, and return terms are detailed in our dedicated policy pages:

• Shipping & Delivery Policy: elunoracrafts.com/help/shipping
• Returns & Exchange Policy: elunoracrafts.com/help/returns

By placing an order, you agree to those policies, which are incorporated into these Terms by reference.`,
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual Property',
    body: `All content on the ELUNORA website — including product images, brand identity, website design, copy, logos, and trademarks — is the exclusive property of ELUNORA or its licensors.

You may not reproduce, distribute, modify, create derivative works, publicly display, or commercially exploit any content without prior written permission from ELUNORA.

User-generated content (product reviews, photos) that you submit grants ELUNORA a non-exclusive, royalty-free, worldwide licence to use, display, and promote such content.`,
  },
  {
    id: 'prohibited',
    title: '8. Prohibited Use',
    body: `You agree not to:

• Use ELUNORA for fraudulent, illegal, or harmful purposes.
• Attempt to gain unauthorised access to our systems, accounts, or data.
• Place bulk orders with intent to resell without prior written agreement.
• Submit false, misleading, or defamatory reviews or content.
• Scrape, crawl, or systematically collect product data without written consent.
• Use our brand name, logo, or assets in a way that implies partnership or endorsement without written approval.`,
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    body: `To the maximum extent permitted by Indian law, ELUNORA's total liability for any claim arising from use of our services shall not exceed the value of the order in question.

ELUNORA is not liable for: indirect, incidental, or consequential damages; delays due to third-party courier partners; force majeure events; or inaccuracies in personalisation text provided by the customer.

Nothing in these Terms limits liability for death, personal injury caused by negligence, or fraud.`,
  },
  {
    id: 'governing-law',
    title: '10. Governing Law & Disputes',
    body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra, India.

We encourage resolution of disputes through direct communication first. Email us at hello@elunoracrafts.com and we commit to a good-faith resolution attempt within 14 days.`,
  },
  {
    id: 'changes',
    title: '11. Changes to These Terms',
    body: `We may update these Terms periodically. Material changes will be communicated via email or website notice. Continued use of ELUNORA after changes are effective constitutes acceptance of the revised Terms.

Last revised: May 2025`,
  },
];

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="Terms of Service | ELUNORA"
        description="ELUNORA's Terms of Service. Read our terms for using the website, placing orders, personalised products, payments, returns, and more."
        noIndex={false}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Terms of Service', 'item': 'https://www.elunoracrafts.com/terms' },
          ],
        }}
      />

      <div className="min-h-screen pt-24 pb-20" style={{ background: '#FAFAF8' }}>

        {/* Hero */}
        <section className="py-12 px-4 text-center" style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 100%)' }}>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl text-white mb-3">
            Terms of Service
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="font-sans text-sm" style={{ color: '#8A6070' }}>
            Last revised: May 2025 &nbsp;·&nbsp; Effective: May 2025
          </motion.p>
        </section>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

          {/* Intro */}
          <div className="mb-10 p-5 rounded-xl" style={{ background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.18)' }}>
            <p className="font-sans text-sm leading-relaxed" style={{ color: '#4B3040' }}>
              Welcome to ELUNORA. These Terms of Service govern your use of our website and services. Please read them carefully. If you have questions, contact us at{' '}
              <a href="mailto:hello@elunoracrafts.com" style={{ color: '#D4A853' }}>hello@elunoracrafts.com</a>.
            </p>
          </div>

          {/* TOC */}
          <div className="mb-10 p-5 rounded-xl" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="font-sans text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF' }}>Table of Contents</p>
            <ol className="space-y-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="font-sans text-sm hover:underline" style={{ color: '#6B7280' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#D4A853')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id}>
                <h2 className="font-serif text-xl mb-4" style={{ color: '#1A0812' }}>{s.title}</h2>
                <div className="font-sans text-sm leading-relaxed whitespace-pre-line" style={{ color: '#4B5563' }}>
                  {s.body}
                </div>
              </section>
            ))}
          </div>

          {/* Links */}
          <div className="mt-12 pt-8 flex flex-wrap gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <Link to="/privacy" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans font-semibold"
              style={{ background: '#1E0812', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>
              Privacy Policy →
            </Link>
            <Link to="/help/faq" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans"
              style={{ background: 'white', color: '#6B7280', border: '1px solid rgba(0,0,0,0.1)' }}>
              FAQ
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

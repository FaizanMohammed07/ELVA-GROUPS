import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead } from '@components/seo/SEOHead';

const SECTIONS = [
  {
    id: 'information-collected',
    title: '1. Information We Collect',
    body: `We collect information you provide directly:

• Account information: name, email address, mobile number, and password when you register.
• Order information: shipping address, billing address, and order history.
• Payment information: transaction references provided by Razorpay (we do not store your card details — these are handled entirely by Razorpay's PCI-DSS compliant infrastructure).
• Personalisation data: custom text, names, dates, and design instructions you provide for personalised products.
• Communication data: messages you send via our contact form, email, or WhatsApp.
• Device and usage data: IP address, browser type, device identifiers, pages visited, and time spent — collected automatically via standard web server logs and analytics tools.`,
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    body: `We use collected information to:

• Process and fulfil your orders, including personalisation crafting and delivery.
• Send order confirmations, shipping updates, and delivery notifications via email and SMS.
• Manage your account and provide customer support.
• Send marketing communications (only if you have opted in — you can unsubscribe anytime).
• Improve our website, products, and service quality.
• Detect and prevent fraud, abuse, and security threats.
• Comply with applicable Indian laws and regulations, including GST and consumer protection laws.`,
  },
  {
    id: 'data-sharing',
    title: '3. Information Sharing',
    body: `We do not sell your personal data. We share information only with:

• Courier and logistics partners (BlueDart, Delhivery, DTDC, etc.) — for delivering your orders.
• Payment processor (Razorpay) — for secure payment processing.
• Email and SMS service providers — for transactional and marketing communications.
• Cloud infrastructure (AWS) — for secure data storage and CDN delivery.
• Analytics providers — in anonymised, aggregated form only.
• Legal authorities — if required by law, court order, or to protect rights and safety.

All third-party partners are contractually required to handle your data securely and only for the purposes we specify.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies & Tracking',
    body: `Our website uses cookies and similar technologies to:

• Keep you signed in (session cookies).
• Remember your cart and preferences.
• Analyse website traffic and improve user experience (analytics cookies).
• Serve relevant advertising (if applicable — marketing cookies, with consent).

You can control cookies through your browser settings. Disabling cookies may affect certain website functionality, including cart persistence and checkout. We do not use third-party advertising cookies without your explicit consent.`,
  },
  {
    id: 'data-security',
    title: '5. Data Security',
    body: `We implement industry-standard security measures:

• All data transmission is encrypted using TLS 1.2+/SSL.
• Passwords are hashed using bcrypt — we never store plain-text passwords.
• Payment data is handled exclusively by Razorpay (PCI-DSS Level 1 certified).
• Access to personal data is restricted to authorised ELUNORA team members on a need-to-know basis.
• We conduct regular security reviews of our infrastructure.

Despite best efforts, no digital transmission is 100% secure. We encourage you to use a strong, unique password for your ELUNORA account.`,
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    body: `You have the right to:

• Access the personal data we hold about you.
• Request correction of inaccurate or incomplete data.
• Request deletion of your account and associated data (subject to legal retention obligations).
• Withdraw consent for marketing communications at any time.
• Lodge a complaint with a supervisory authority if you believe your data rights are being violated.

To exercise any of these rights, email us at privacy@elunoracrafts.com. We respond within 30 days.`,
  },
  {
    id: 'data-retention',
    title: '7. Data Retention',
    body: `We retain your personal data for as long as your account is active or as needed to provide services. Specifically:

• Order records are retained for 7 years to comply with Indian GST laws.
• Inactive accounts are deleted after 3 years of inactivity.
• Marketing data is deleted upon unsubscription request.
• Support communications are retained for 2 years.

You may request deletion of your account at any time, subject to the above legal retention requirements.`,
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    body: `ELUNORA's services are not directed to children under the age of 13. We do not knowingly collect personal information from children. If you are a parent and believe your child has provided us personal data, contact us at privacy@elunoracrafts.com and we will delete it promptly.`,
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Revised" date. For significant changes, we will notify you via email or a prominent website notice. Continued use of ELUNORA after changes are posted constitutes acceptance of the revised policy.`,
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    body: `For privacy-related queries, data access requests, or concerns:

Email: privacy@elunoracrafts.com
General: hello@elunoracrafts.com
Address: ELUNORA, c/o DEVUP Ecosystem, VJIT, Mumbai, India

We respond to all privacy queries within 30 business days.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | ELUNORA"
        description="ELUNORA's Privacy Policy. How we collect, use, and protect your personal information. GDPR-aligned, India-compliant, and user-first."
        noIndex={false}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.elunoracrafts.com/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Privacy Policy', 'item': 'https://www.elunoracrafts.com/privacy' },
          ],
        }}
      />

      <div className="min-h-screen pt-24 pb-20" style={{ background: '#FAFAF8' }}>

        {/* Hero */}
        <section className="py-12 px-4 text-center" style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 100%)' }}>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl text-white mb-3">
            Privacy Policy
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
              ELUNORA ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website at{' '}
              <a href="https://www.elunoracrafts.com" style={{ color: '#D4A853' }}>www.elunoracrafts.com</a> or purchase our products.
              By using our services, you agree to the practices described in this Policy.
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
            <Link to="/terms" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-sans font-semibold"
              style={{ background: '#1E0812', color: '#D4A853', border: '1px solid rgba(212,168,83,0.2)' }}>
              Terms of Service →
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

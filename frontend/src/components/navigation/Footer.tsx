import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessageCircle, Heart, ExternalLink, Twitter, Linkedin, PinIcon } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { label: 'New Arrivals', href: '/products?sort=new' },
    { label: 'Best Sellers', href: '/products?sort=bestseller' },
    { label: 'Personalized Gifts', href: '/category/personalized-gifts' },
    { label: 'Corporate Gifting', href: '/category/corporate-gifting' },
    { label: 'Luxury Hampers', href: '/category/luxury-hampers' },
    { label: 'Gift Finder', href: '/gift-finder' },
  ],
  Discover: [
    { label: 'Our Craft Story', href: '/our-craft' },
    { label: 'Gifting Guide', href: '/gifting-guide' },
    { label: 'About ELUNORA', href: '/about' },
    { label: 'Our Artisans', href: '/our-craft#artisans' },
    { label: 'Sustainability', href: '/our-craft#sustainability' },
    { label: 'Custom Orders', href: '/custom-order' },
  ],
  Help: [
    { label: 'Shipping & Delivery', href: '/help/shipping' },
    { label: 'Returns & Exchange', href: '/help/returns' },
    { label: 'FAQ', href: '/help/faq' },
    { label: 'Order Tracking', href: '/account/orders' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'About DEVUP', href: 'https://www.devupecosystem.com' },
  ],
};

const SOCIAL = [
  {
    icon: Instagram,
    href: 'https://www.instagram.com/elunoracrafts?igsh=MWdkY3VhdmU1MG13OA==',
    label: 'Instagram',
  },
  {
    icon: Facebook,
    href: 'https://www.facebook.com/share/1B5ciQNTAX/',
    label: 'Facebook',
  },
  {
    icon: Youtube,
    href: 'https://youtube.com/@elunoracrafts?si=c_ZYCW6a-JsZSV6U',
    label: 'YouTube',
  },
  {
    icon: MessageCircle,
    href: 'https://wa.me/919999999999',
    label: 'WhatsApp',
  },
  {
    icon: Twitter,
    href: 'https://x.com/elunoracrafts',
    label: 'Twitter / X',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/company/elunoracrafts',
    label: 'LinkedIn',
  },
  {
    icon: PinIcon,
    href: 'https://www.pinterest.com/elunoracrafts',
    label: 'Pinterest',
  },
];

export const Footer = () => (
  <footer
    style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 55%, #1A0820 100%)' }}
    aria-label="Site footer"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">

        {/* Brand */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <Link to="/" aria-label="ELUNORA Home">
            <span className="font-display text-3xl tracking-[0.4em] text-white">ELUNORA</span>
          </Link>
          <p className="font-sans text-sm mt-4 leading-relaxed" style={{ color: '#8A6070' }}>
            India's finest handcrafted gifting &amp; lifestyle brand. Every piece made with love by skilled artisans.
          </p>

          {/* Social icons */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: 'rgba(196,96,122,0.12)',
                  border: '1px solid rgba(196,96,122,0.2)',
                  color: '#C4A0B0',
                }}
                aria-label={`Follow ELUNORA on ${label}`}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>

          {/* Trust badge */}
          <div
            className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-sans tracking-wider uppercase"
            style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.15)', color: '#D4A853' }}
          >
            <span>✦</span> Handcrafted in India
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h4
              className="font-sans font-semibold text-xs tracking-widest uppercase mb-5"
              style={{ color: '#D4A853' }}
            >
              {title}
            </h4>
            <ul className="space-y-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith('http') ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-sm transition-colors duration-200 inline-flex items-center gap-1"
                      style={{ color: '#8A6070' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C4A0B0')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#8A6070')}
                    >
                      {label} <ExternalLink size={9} />
                    </a>
                  ) : (
                    <Link
                      to={href}
                      className="font-sans text-sm transition-colors duration-200"
                      style={{ color: '#8A6070' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#C4A0B0')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#8A6070')}
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter strip */}
      <div
        className="mb-8 py-5 px-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: 'rgba(212,168,83,0.05)', border: '1px solid rgba(212,168,83,0.1)' }}
      >
        <div>
          <p className="font-sans text-xs font-semibold tracking-wide text-white mb-0.5">Get ₹100 off your first order</p>
          <p className="font-sans text-xs" style={{ color: '#8A6070' }}>Subscribe for new collections, exclusive offers & artisan stories.</p>
        </div>
        <form className="flex gap-0 flex-shrink-0 w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email"
            className="px-4 py-2.5 text-xs font-sans focus:outline-none flex-1 sm:w-52"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(212,168,83,0.2)',
              borderRight: 'none',
              color: '#F0D8E0',
            }}
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-semibold font-sans whitespace-nowrap"
            style={{ background: 'rgba(212,168,83,0.2)', color: '#D4A853', border: '1px solid rgba(212,168,83,0.3)' }}
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* DEVUP Incubation Badge */}
      <div
        className="mb-8 py-4 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p className="font-sans text-xs tracking-wide" style={{ color: '#5A4050' }}>
          Backed &amp; Incubated by
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://www.devupecosystem.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            style={{ color: '#7A6070' }}
            aria-label="DEVUP Ecosystem"
          >
            <span className="font-sans text-xs font-semibold tracking-widest uppercase">DEVUP Ecosystem</span>
            <ExternalLink size={10} />
          </a>
          <span style={{ color: '#3A2030' }}>·</span>
          <a
            href="https://www.devupvjit.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            style={{ color: '#7A6070' }}
            aria-label="DEVUP Society VJIT"
          >
            <span className="font-sans text-xs font-semibold tracking-widest uppercase">DEVUP Society, VJIT</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderColor: 'rgba(196,96,122,0.15)' }}
      >
        <p className="font-sans text-xs flex items-center gap-1.5" style={{ color: '#5A3040' }}>
          © {new Date().getFullYear()} ELUNORA. All rights reserved. Made with
          <Heart size={11} className="fill-current" style={{ color: '#C4607A' }} />
          in India.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="font-sans text-[10px] transition-colors" style={{ color: '#3A2030' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#8A6070')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#3A2030')}>
            Privacy
          </Link>
          <span style={{ color: '#3A2030' }}>·</span>
          <Link to="/terms" className="font-sans text-[10px] transition-colors" style={{ color: '#3A2030' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#8A6070')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#3A2030')}>
            Terms
          </Link>
          <span style={{ color: '#3A2030' }}>·</span>
          <p className="font-sans text-[10px] tracking-wider" style={{ color: '#3A2030' }}>
            PREMIUM · HANDCRAFTED · ETHICAL
          </p>
        </div>
      </div>
    </div>
  </footer>
);

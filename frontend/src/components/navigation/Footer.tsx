import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessageCircle, Heart } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { label: 'New Arrivals', href: '/products?sort=new' },
    { label: 'Best Sellers', href: '/products?sort=bestseller' },
    { label: 'Personalized Gifts', href: '/category/personalized-gifts' },
    { label: 'Corporate Gifting', href: '/category/corporate-gifting' },
    { label: 'Subscription Boxes', href: '/category/subscription-boxes' },
    { label: 'Gift Finder', href: '/gift-finder' },
  ],
  Help: [
    { label: 'Shipping & Delivery', href: '/help/shipping' },
    { label: 'Returns & Exchange', href: '/help/returns' },
    { label: 'Order Tracking', href: '/account/orders' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/help/faq' },
  ],
  Company: [
    { label: 'About ELUNORA', href: '/about' },
    { label: 'Our Artisans', href: '/about#artisans' },
    { label: 'Sustainability', href: '/about#sustainability' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const SOCIAL = [
  { icon: Instagram, href: 'https://instagram.com/elva.in', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/elva.in', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com/@elva', label: 'YouTube' },
  { icon: MessageCircle, href: 'https://wa.me/919999999999', label: 'WhatsApp' },
];

export const Footer = () => (
  <footer
    style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 55%, #1A0820 100%)' }}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/">
            <span className="font-display text-3xl tracking-[0.4em] text-white">ELUNORA</span>
          </Link>
          <p
            className="font-sans text-sm mt-4 leading-relaxed"
            style={{ color: '#8A6070' }}
          >
            India's finest handcrafted gifting & lifestyle brand. Every piece made with love.
          </p>
          <div className="flex gap-3 mt-6">
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
                aria-label={label}
              >
                <Icon size={15} />
              </a>
            ))}
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
                  <Link
                    to={href}
                    className="font-sans text-sm transition-colors duration-200"
                    style={{ color: '#8A6070' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#C4A0B0')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#8A6070')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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

      </div>
    </div>
  </footer>
);

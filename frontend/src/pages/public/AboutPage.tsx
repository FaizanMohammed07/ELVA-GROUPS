import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="bg-charcoal-950 py-32 px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold-400 text-xs tracking-[0.4em] uppercase font-sans mb-4"
        >
          Our Story
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-5xl md:text-6xl text-white mb-6 max-w-3xl mx-auto leading-tight"
        >
          Crafted with Love, Delivered with Care
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-sans text-charcoal-300 max-w-xl mx-auto leading-relaxed"
        >
          ELVA was born from a simple belief — every gift should tell a story. We are India's home for handcrafted,
          personalised gifts that carry emotion, artistry, and meaning.
        </motion.p>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold-600 text-xs tracking-[0.4em] uppercase font-sans mb-4">Our Mission</p>
            <h2 className="font-serif text-4xl text-charcoal-950 mb-6">Redefining the Art of Gifting</h2>
            <p className="font-sans text-charcoal-600 leading-relaxed mb-4">
              In a world of mass production, ELVA champions the handcrafted. We collaborate with skilled artisans
              across India — from clay sculptors in Jaipur to candle makers in Bangalore — to bring you pieces
              that are truly one of a kind.
            </p>
            <p className="font-sans text-charcoal-600 leading-relaxed">
              Every product is made with care, packaged with intention, and delivered with the promise that
              when you give ELVA, you give something that matters.
            </p>
          </div>
          <div className="aspect-[4/3] bg-cream-100" />
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-gold-600 text-xs tracking-[0.4em] uppercase font-sans mb-4 text-center">What We Stand For</p>
          <h2 className="font-serif text-4xl text-charcoal-950 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Artisanal Quality', body: 'Every piece is handcrafted by skilled artisans using ethically sourced materials. No two pieces are identical.' },
              { title: 'Deep Personalisation', body: 'We believe gifts become heirlooms when they carry personal meaning. That\'s why we make personalisation central to every product.' },
              { title: 'Sustainable Craft', body: 'From natural waxes to recycled packaging, we are committed to practices that honour both artisans and our planet.' },
            ].map(({ title, body }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 bg-gold-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gold-500 rounded-full" />
                </div>
                <h3 className="font-serif text-xl text-charcoal-950 mb-3">{title}</h3>
                <p className="font-sans text-charcoal-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-charcoal-950 py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Happy Customers', value: '10,000+' },
            { label: 'Handcrafted Products', value: '500+' },
            { label: 'Artisan Partners', value: '50+' },
            { label: 'Cities Delivered', value: '200+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-serif text-4xl text-gold-400 mb-2">{value}</p>
              <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <p className="text-gold-600 text-xs tracking-[0.4em] uppercase font-sans mb-4">Start Gifting</p>
        <h2 className="font-serif text-4xl text-charcoal-950 mb-6">Find Your Perfect Gift</h2>
        <p className="font-sans text-charcoal-500 mb-8 max-w-md mx-auto">
          Explore our collections of handcrafted gifts for every occasion, every person, every emotion.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/products" className="btn-primary px-10 py-4">Shop Now</Link>
          <Link to="/gift-finder" className="btn-outline px-10 py-4">Gift Finder</Link>
        </div>
      </section>
    </div>
  );
}

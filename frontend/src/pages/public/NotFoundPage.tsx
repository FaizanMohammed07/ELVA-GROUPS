import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-gold-400 text-xs tracking-[0.4em] uppercase font-sans mb-4">404</p>
        <h1 className="font-serif text-6xl md:text-8xl text-charcoal-950 mb-4">Lost?</h1>
        <p className="font-sans text-charcoal-500 text-lg mb-10 max-w-md mx-auto">
          The page you're looking for doesn't exist. But our handcrafted collections are waiting for you.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary px-10 py-4">Go Home</Link>
          <Link to="/products" className="btn-outline px-10 py-4">Browse Products</Link>
        </div>
      </motion.div>
    </div>
  );
}

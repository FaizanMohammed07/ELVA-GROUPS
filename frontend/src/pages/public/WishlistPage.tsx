import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@store/wishlistStore';
import { productsApi } from '@api/products.api';
import { Heart, Sparkles } from 'lucide-react';
import { ProductCard } from '@components/products/ProductCard';

// Curated bestsellers to show in the empty state
const CURATED_BESTSELLERS = [
  {
    id: 'prod-0',
    title: 'Serenity Soy Candle — Sandalwood & Vanilla',
    slug: 'serenity-soy-candle-sandalwood-vanilla',
    price: 799,
    compareAtPrice: 999,
    thumbnail: '/products/prod-1.png',
    rating: 4.8,
    reviewCount: 124,
    isBestSeller: true,
  },
  {
    id: 'prod-1',
    title: 'Personalised Heart Locket Necklace',
    slug: 'personalised-heart-locket-necklace',
    price: 1499,
    compareAtPrice: 1999,
    thumbnail: '/products/prod-2.png',
    rating: 4.9,
    reviewCount: 89,
    isNewArrival: true,
  },
  {
    id: 'prod-2',
    title: 'Terracotta Ganesha Sculpture',
    slug: 'terracotta-ganesha-sculpture',
    price: 2499,
    compareAtPrice: 2999,
    thumbnail: '/products/prod-3.png',
    rating: 5.0,
    reviewCount: 34,
    isBestSeller: true,
  },
  {
    id: 'prod-5',
    title: 'Sleek Handcrafted Clay Art Duo',
    slug: 'sleek-handcrafted-clay-art-duo',
    price: 1899,
    compareAtPrice: 2499,
    thumbnail: '/products/prod-6.png',
    rating: 4.9,
    reviewCount: 42,
    isBestSeller: true,
  },
];

// Curious movement floating heart configuration
const HEART_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: Math.floor(Math.random() * 10) + 12, // 12px to 22px
  delay: i * 0.4,
  duration: Math.random() * 2 + 3, // 3s to 5s
  left: `${15 + Math.random() * 70}%`,
  rotate: Math.random() * 30 - 15,
}));

export default function WishlistPage() {
  const { productIds } = useWishlistStore();
  const wishlistIds = Array.from(productIds);

  const { data: products, isLoading } = useQuery({
    queryKey: ['wishlist-products', wishlistIds],
    queryFn: async () => {
      if (wishlistIds.length === 0) return [];
      const results = await Promise.all(wishlistIds.map(id => productsApi.getById(id).then(r => r.data.data)));
      return results;
    },
    enabled: wishlistIds.length > 0,
  });

  if (wishlistIds.length === 0) {
    return (
      <div 
        className="min-h-screen pt-28 sm:pt-32 pb-16 flex flex-col justify-center items-center"
        style={{ background: 'linear-gradient(160deg, #FDF6EE 0%, #FFF5F7 100%)' }}
      >
        {/* Double-pane high conversion layout */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Compact Empty State Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 w-full bg-white/45 backdrop-blur-xl border border-rose-100/60 rounded-[40px] p-8 sm:p-10 text-center shadow-[0_20px_50px_rgba(196,96,122,0.03)] relative overflow-hidden flex flex-col justify-center min-h-[480px]"
            >
              {/* Ambient Background Glows */}
              <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#D4A853]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#C4607A]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Curious Floating Hearts container */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {HEART_PARTICLES.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute text-rose-400/25"
                    style={{
                      left: particle.left,
                      bottom: '25%',
                    }}
                    initial={{ y: 60, opacity: 0, scale: 0.4 }}
                    animate={{
                      y: -180,
                      opacity: [0, 0.8, 0.8, 0],
                      scale: [0.4, 1.1, 1.1, 0.5],
                      rotate: [particle.rotate, particle.rotate + 20],
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  >
                    <Heart size={particle.size} fill="currentColor" />
                  </motion.div>
                ))}
              </div>

              {/* Large Interactive Glowing Heart */}
              <div className="relative z-10 flex-grow flex flex-col justify-center items-center">
                <motion.div 
                  whileHover={{ scale: 1.12, rotate: 6 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-[#FFF0F3] to-[#FFF5F7] rounded-[24px] border border-rose-100 shadow-sm cursor-pointer group"
                >
                  {/* Backlight Pulse */}
                  <div className="absolute inset-0 bg-[#C4607A]/10 rounded-[24px] blur-xl group-hover:bg-[#C4607A]/25 transition-all duration-500 scale-90 group-hover:scale-110" />
                  <Heart size={34} className="text-[#C4607A] transition-transform duration-300 group-hover:scale-110" fill="#C4607A" />
                </motion.div>

                <h1 className="font-display text-2xl sm:text-3xl text-[#1A0812] tracking-tight leading-tight mb-3">
                  Your wishlist is empty
                </h1>
                
                <p className="font-sans text-xs sm:text-sm text-[#9B7080] max-w-xs mx-auto leading-relaxed mb-8">
                  Save the artisanal creations you love to build your ultimate custom gifting collection.
                </p>

                {/* Magnetic Interactive Glow Button */}
                <Link 
                  to="/products" 
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase text-white transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-[#C4607A]/20 overflow-hidden relative group"
                  style={{ 
                    background: 'linear-gradient(135deg, #1A0812 0%, #2A0F1E 100%)',
                    boxShadow: '0 10px 30px rgba(26,8,18,0.2)',
                    borderRadius: '100px'
                  }}
                >
                  <Sparkles size={13} className="text-[#D4A853] animate-pulse" />
                  <span>Explore Products</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Handcrafted Bestsellers (Instantly visible above the fold on desktop!) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 w-full flex flex-col justify-center"
            >
              <div className="mb-6 text-left">
                <span className="text-[10px] font-sans tracking-[0.38em] uppercase text-[#C4607A] font-bold block mb-1.5">
                  ✦ Highly Desired Bestsellers ✦
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-[#1A0812]">
                  Exquisite Handcrafted Creations
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#9B7080] mt-1.5">
                  Artisan creations with glowing reviews — ready to ship and personalize.
                </p>
              </div>

              {/* Grid of Bestsellers */}
              <div className="grid grid-cols-2 gap-4 sm:gap-5 px-0.5">
                {CURATED_BESTSELLERS.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pt-32 sm:pt-40 pb-24"
      style={{ background: 'linear-gradient(160deg, #FDF6EE 0%, #FFF5F7 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Section */}
        <div className="flex items-baseline justify-between border-b border-[#D4A853]/15 pb-6 mb-12">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-3xl sm:text-5xl text-[#1A0812]">Wishlist</h1>
            <span className="bg-[#C4607A]/10 text-[#C4607A] border border-[#C4607A]/25 px-3 py-1 rounded-full text-xs font-bold font-sans">
              {wishlistIds.length} {wishlistIds.length === 1 ? 'creation' : 'creations'}
            </span>
          </div>
          <Link to="/products" className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#C4607A] hover:text-[#1A0812] transition-colors flex items-center gap-2">
            Add More <Sparkles size={12} />
          </Link>
        </div>

        {/* Wishlist Grid with Unified Luxury Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: wishlistIds.length }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-[32px] bg-charcoal-50/50 skeleton animate-pulse border border-charcoal-100/10" />
              ))
            : products?.map((product: any, i: number) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>
      </div>
    </div>
  );
}

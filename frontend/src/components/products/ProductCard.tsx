import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';
import { useUIStore } from '@store/uiStore';
import { cn } from '@utils/cn';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  thumbnail?: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  isPersonalizable?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isLimitedEdition?: boolean;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  showNewBadge?: boolean;
}

export const ProductCard = ({ product, index = 0, showNewBadge }: ProductCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { openCart } = useUIStore();
  const isWishlisted = has(product.id);

  // 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });
  const glareX = useTransform(mx, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(my, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    glareOpacity.set(0.12);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    glareOpacity.set(0);
  };

  const discountPct = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) { toast.error('Out of stock'); return; }
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      thumbnail: product.thumbnail || product.images?.[0] || '',
      price: product.price,
      quantity: 1,
      stock: product.stock ?? 0,
    });
    toast.success('Added to bag!');
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, perspective: 900, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <Link to={`/products/${product.slug}`} className="product-card block group bg-white/40 backdrop-blur-md p-3.5 rounded-[32px] border border-charcoal-100/35 hover:border-[#D4A853]/40 shadow-sm hover:shadow-[0_20px_50px_rgba(212,168,83,0.06)] transition-all duration-500 hover:scale-102">
        {/* Image container */}
        <div className="relative overflow-hidden bg-[#FAF7F2] aspect-[3/4] rounded-[24px]">
          <img
            src={product.thumbnail || product.images?.[0] || '/placeholder.svg'}
            alt={product.title}
            className="product-card-image w-full h-full object-cover transition-transform duration-[8s] group-hover:scale-105"
            loading="lazy"
          />

          {/* Glare overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              opacity: glareOpacity,
              background: useTransform(
                [glareX, glareY],
                ([x, y]) =>
                  `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.9) 0%, transparent 60%)`,
              ),
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discountPct > 0 && (
              <span className="badge bg-rose-500/90 text-white px-2.5 py-1 text-[8px] font-extrabold tracking-widest uppercase rounded-full border border-white/20 shadow-sm backdrop-blur-md">
                -{discountPct}% OFF
              </span>
            )}
            {(showNewBadge || product.isNewArrival) && (
              <span className="badge text-white text-[8px] tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10 shadow-sm backdrop-blur-md" style={{ background: 'rgba(26,8,18,0.92)' }}>
                New In
              </span>
            )}
            {product.isBestSeller && (
              <span className="badge text-white text-[8px] tracking-widest uppercase px-2.5 py-1 rounded-full border border-[#D4A853]/30 shadow-sm backdrop-blur-md" style={{ background: 'rgba(212,168,83,0.92)' }}>
                Best Seller
              </span>
            )}
            {product.isLimitedEdition && (
              <span className="badge bg-red-600/95 text-white text-[8px] tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10 shadow-sm backdrop-blur-md">
                Limited
              </span>
            )}
            {product.isPersonalizable && (
              <span className="badge text-white text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 shadow-sm backdrop-blur-md animate-pulse" style={{ background: 'rgba(196,96,122,0.92)' }}>
                Personalize ✨
              </span>
            )}
          </div>

          {/* Add to bag — slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 text-xs tracking-[0.2em] uppercase font-bold font-sans flex items-center justify-center gap-2 transition-colors duration-300"
              style={{ background: '#1A0812', color: '#FDF6EE' }}
            >
              <ShoppingBag size={12} className="animate-bounce" /> Add to Bag
            </button>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 z-10 w-9 h-9 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-full shadow-sm transition-all duration-300 border border-white/85',
              'md:opacity-0 md:group-hover:opacity-100 scale-90 md:scale-95 group-hover:scale-100 hover:bg-white',
            )}
          >
            <Heart
              size={14}
              className={cn(isWishlisted ? 'fill-red-500 text-red-500' : 'text-charcoal-700 hover:text-red-500')}
            />
          </button>
        </div>

        {/* Info */}
        <div className="pt-4 pb-2 px-2 space-y-2">
          {/* Handcrafted Hook Tag */}
          <span className="text-[9px] font-sans font-bold tracking-[0.25em] uppercase text-[#D4A853] block">
            ✨ Studio Original
          </span>
          
          <h3 className="font-sans text-sm font-bold text-charcoal-950 line-clamp-1 leading-snug group-hover:text-charcoal-700 transition-colors">
            {product.title}
          </h3>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-sm text-charcoal-950">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice && (
                <span className="font-sans text-charcoal-400 text-xs line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Rating Stars Badge */}
            {product.rating !== undefined ? (
              <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#D4A853]/20 px-2 py-0.5 rounded-full">
                <Star size={10} className="fill-[#D4A853] text-[#D4A853]" />
                <span className="text-[10px] text-charcoal-700 font-bold font-sans">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded-full">
                <Star size={10} className="fill-[#D4A853] text-[#D4A853]" />
                <span className="text-[10px] text-charcoal-700 font-bold font-sans">
                  4.8
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

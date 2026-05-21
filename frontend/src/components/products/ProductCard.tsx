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
      <Link to={`/products/${product.slug}`} className="product-card block group">
        {/* Image container */}
        <div className="relative overflow-hidden bg-cream-50 aspect-[3/4]">
          <img
            src={product.thumbnail || product.images?.[0] || '/placeholder.svg'}
            alt={product.title}
            className="product-card-image"
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
              <span className="badge bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold tracking-wide">
                -{discountPct}%
              </span>
            )}
            {(showNewBadge || product.isNewArrival) && (
              <span className="badge text-white text-[10px] tracking-widest uppercase px-2 py-0.5" style={{ background: '#1A0812' }}>
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="badge text-white text-[10px] tracking-widest uppercase px-2 py-0.5" style={{ background: '#D4A853' }}>
                Bestseller
              </span>
            )}
            {product.isLimitedEdition && (
              <span className="badge bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-0.5">
                Limited
              </span>
            )}
            {product.isPersonalizable && (
              <span className="badge text-white text-[10px] uppercase px-2 py-0.5" style={{ background: '#C4607A' }}>
                Personalizable
              </span>
            )}
          </div>

          {/* Add to bag — slides up on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 text-xs tracking-widest uppercase font-semibold font-sans flex items-center justify-center gap-2 transition-colors duration-200"
              style={{ background: '#1A0812', color: '#FDF6EE' }}
            >
              <ShoppingBag size={13} /> Add to Bag
            </button>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 flex items-center justify-center shadow-sm transition-all duration-200',
              'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100',
            )}
          >
            <Heart
              size={15}
              className={cn(isWishlisted ? 'fill-red-500 text-red-500' : 'text-charcoal-700')}
            />
          </button>
        </div>

        {/* Info */}
        <div className="pt-4 pb-2 space-y-1.5">
          <h3 className="font-sans text-sm font-medium text-charcoal-900 line-clamp-2 leading-snug group-hover:text-charcoal-700 transition-colors">
            {product.title}
          </h3>

          {product.rating !== undefined && (
            <div className="flex items-center gap-1.5">
              <Star size={11} className="fill-gold-400 text-gold-400" />
              <span className="text-[11px] text-charcoal-500 font-sans">
                {product.rating.toFixed(1)} ({product.reviewCount || 0})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-sm" style={{ color: '#1A0812' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && (
              <span className="font-sans text-charcoal-400 text-xs line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

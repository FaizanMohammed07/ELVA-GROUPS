import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';
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
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const isWishlisted = has(product.id);
  const discountPct = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      thumbnail: product.thumbnail || product.images?.[0] || '',
      price: product.price,
      quantity: 1,
      stock: product.stock ?? 99,
    });
    toast.success(`${product.title} added to cart`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/products/${product.slug}`} className="product-card block group">
        {/* Image container */}
        <div className="relative overflow-hidden bg-cream-50 aspect-[3/4]">
          <img
            src={product.thumbnail || product.images?.[0] || '/placeholder.jpg'}
            alt={product.title}
            className="product-card-image"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {discountPct > 0 && (
              <span className="badge bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold tracking-wide">
                -{discountPct}%
              </span>
            )}
            {(showNewBadge || product.isNewArrival) && (
              <span className="badge bg-charcoal-950 text-white text-[10px] tracking-widest uppercase px-2 py-0.5">New</span>
            )}
            {product.isBestSeller && (
              <span className="badge bg-gold-500 text-white text-[10px] tracking-widest uppercase px-2 py-0.5">Bestseller</span>
            )}
            {product.isLimitedEdition && (
              <span className="badge bg-red-600 text-white text-[10px] tracking-widest uppercase px-2 py-0.5">Limited</span>
            )}
            {product.isPersonalizable && (
              <span className="badge bg-elva-600 text-white text-[10px] uppercase px-2 py-0.5">Personalizable</span>
            )}
          </div>

          {/* Action buttons on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-charcoal-950 text-white py-3 text-xs tracking-widest uppercase font-medium hover:bg-charcoal-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> Add to Bag
              </button>
            </div>
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={cn(
              'absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 flex items-center justify-center shadow-sm transition-all duration-200',
              'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100',
            )}
          >
            <Heart
              size={16}
              className={cn(isWishlisted ? 'fill-red-500 text-red-500' : 'text-charcoal-700')}
            />
          </button>
        </div>

        {/* Product info */}
        <div className="pt-4 pb-2 space-y-1.5">
          <h3 className="font-sans text-sm font-medium text-charcoal-900 line-clamp-2 leading-snug group-hover:text-charcoal-700 transition-colors">
            {product.title}
          </h3>

          {product.rating !== undefined && (
            <div className="flex items-center gap-1.5">
              <Star size={12} className="fill-gold-400 text-gold-400" />
              <span className="text-[12px] text-charcoal-600 font-sans">
                {product.rating.toFixed(1)} ({product.reviewCount || 0})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-charcoal-950 text-sm">
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

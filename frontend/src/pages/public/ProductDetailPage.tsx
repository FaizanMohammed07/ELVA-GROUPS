import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { productsApi } from '@api/products.api';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';
import { useUIStore } from '@store/uiStore';
import { ProductCard } from '@components/products/ProductCard';
import { Heart, ShoppingBag, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { cn } from '@utils/cn';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState<Record<string, string>>({});
  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { openCart } = useUIStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug!).then(r => r.data.data),
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ['product', slug, 'related'],
    queryFn: () => productsApi.getRelated(product.id).then(r => r.data.data),
    enabled: !!product?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] skeleton" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 skeleton rounded" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = has(product.id);
  const images = product.images?.length ? product.images : [product.thumbnail || '/placeholder.jpg'];

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      thumbnail: images[0],
      price: product.price,
      quantity,
      personalization: Object.keys(personalization).length ? personalization : undefined,
      stock: product.stock,
    });
    toast.success('Added to bag!');
    openCart();
  };

  return (
    <div className="min-h-screen pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-cream-50">
              <motion.img
                key={selectedImage}
                src={images[selectedImage]}
                alt={product.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn('flex-shrink-0 w-20 h-24 overflow-hidden border-2 transition-colors', selectedImage === i ? 'border-charcoal-950' : 'border-transparent')}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-gold-600 text-xs tracking-[0.3em] uppercase font-sans mb-2">ELVA Collection</p>
              <h1 className="font-serif text-4xl text-charcoal-950 leading-tight">{product.title}</h1>
            </div>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={cn('transition-colors', i < Math.round(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-charcoal-200')} />
                  ))}
                </div>
                <span className="text-sm text-charcoal-500 font-sans">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="font-sans text-3xl font-semibold text-charcoal-950">₹{product.price.toLocaleString('en-IN')}</span>
              {product.compareAtPrice && (
                <>
                  <span className="font-sans text-lg text-charcoal-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-0.5">
                    Save ₹{(product.compareAtPrice - product.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className={cn('flex items-center gap-2 text-sm font-sans', product.stock > 0 ? 'text-green-600' : 'text-red-500')}>
              <div className={cn('w-2 h-2 rounded-full', product.stock > 0 ? 'bg-green-500' : 'bg-red-500')} />
              {product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock') : 'Out of Stock'}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="font-sans text-charcoal-600 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Personalization fields */}
            {product.isPersonalizable && product.personalizationFields?.length > 0 && (
              <div className="border border-elva-200 bg-elva-50 p-5 space-y-4">
                <p className="font-sans font-semibold text-charcoal-800 text-sm">✏️ Personalize Your Gift</p>
                {product.personalizationFields.map((field: any) => (
                  <div key={field.key}>
                    <label className="block text-xs font-sans text-charcoal-600 mb-1.5 uppercase tracking-wide">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        onChange={(e) => setPersonalization(p => ({ ...p, [field.key]: e.target.value }))}
                        className="input-luxury w-full resize-none h-20"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        onChange={(e) => setPersonalization(p => ({ ...p, [field.key]: e.target.value }))}
                        className="input-luxury w-full"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        onChange={(e) => setPersonalization(p => ({ ...p, [field.key]: e.target.value }))}
                        className="input-luxury"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <p className="font-sans text-sm text-charcoal-600">Quantity</p>
              <div className="flex items-center border border-charcoal-200">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-charcoal-50 transition-colors text-charcoal-700">−</button>
                <span className="w-12 text-center font-sans text-sm">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-charcoal-50 transition-colors text-charcoal-700">+</button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-3 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} /> Add to Bag
              </button>
              <button
                onClick={() => { toggle(product.id); toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
                className={cn('border px-4 py-4 transition-colors', isWishlisted ? 'border-red-300 bg-red-50' : 'border-charcoal-200 hover:border-charcoal-950')}
              >
                <Heart size={18} className={cn(isWishlisted ? 'fill-red-500 text-red-500' : 'text-charcoal-700')} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-charcoal-100">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders above ₹999' },
                { icon: Shield, label: 'Secure Payment', sub: 'Razorpay & UPI' },
                { icon: RefreshCw, label: '7-Day Returns', sub: 'Easy & free' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon size={20} className="text-charcoal-500 mx-auto mb-1" />
                  <p className="font-sans text-xs font-medium text-charcoal-700">{label}</p>
                  <p className="font-sans text-[11px] text-charcoal-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related?.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-3xl text-charcoal-950 mb-8 text-center">You May Also Love</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.slice(0, 4).map((p: any, i: number) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

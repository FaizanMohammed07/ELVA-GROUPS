import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi } from '@api/products.api';
import { apiClient } from '@api/client';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';
import { useUIStore } from '@store/uiStore';
import { useAuthStore } from '@store/authStore';
import { ProductCard } from '@components/products/ProductCard';
import { Heart, ShoppingBag, Star, Truck, Shield, RefreshCw, ChevronRight, Send } from 'lucide-react';
import { cn } from '@utils/cn';
import toast from 'react-hot-toast';

const TABS = ['Description', 'Details', 'Reviews'] as const;
type Tab = typeof TABS[number];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>('Description');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const { addItem } = useCartStore();
  const { toggle, has } = useWishlistStore();
  const { openCart } = useUIStore();
  const { isAuthenticated } = useAuthStore();

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

  const { data: reviewsData } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: () => apiClient.get(`/reviews/product/${product!.id}`).then(r => r.data.data).catch(() => ({ reviews: [] })),
    enabled: !!product?.id,
  });

  const reviews: any[] = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.reviews || reviewsData?.items || []);

  const reviewMutation = useMutation({
    mutationFn: (body: any) => apiClient.post('/reviews', body),
    onSuccess: () => {
      toast.success('Review submitted!');
      setReviewText('');
      setReviewRating(5);
      qc.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
      qc.invalidateQueries({ queryKey: ['product', slug] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit review'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] skeleton" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 skeleton" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = has(product.id);
  const images = product.images?.length ? product.images : [product.thumbnail || '/placeholder.svg'];

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

  const handleBuyNow = () => {
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
    navigate('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to write a review'); return; }
    if (!reviewText.trim()) { toast.error('Please write something'); return; }
    reviewMutation.mutate({ productId: product.id, rating: reviewRating, body: reviewText });
  };

  return (
    <div className="min-h-screen pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs font-sans text-charcoal-400 mb-8">
          <Link to="/" className="hover:text-charcoal-700 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-charcoal-700 transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight size={12} />
              <Link to={`/category/${product.category}`} className="hover:text-charcoal-700 transition-colors capitalize">{product.category.replace(/-/g, ' ')}</Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-charcoal-600 line-clamp-1">{product.title}</span>
        </nav>

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
                    className={cn('flex-shrink-0 w-20 h-24 overflow-hidden border-2 transition-colors', selectedImage === i ? 'border-charcoal-950' : 'border-transparent hover:border-charcoal-300')}
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
              <button onClick={() => setTab('Reviews')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={cn(i < Math.round(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-charcoal-200')} />
                  ))}
                </div>
                <span className="text-sm text-charcoal-500 font-sans underline underline-offset-2">{product.rating?.toFixed(1)} ({product.reviewCount} reviews)</span>
              </button>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="font-sans text-3xl font-semibold text-charcoal-950">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.compareAtPrice && (
                <>
                  <span className="font-sans text-lg text-charcoal-400 line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                  <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-0.5">
                    Save ₹{(product.compareAtPrice - product.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
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
                      <select onChange={(e) => setPersonalization(p => ({ ...p, [field.key]: e.target.value }))} className="input-luxury w-full">
                        <option value="">Select {field.label}</option>
                        {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type="text" placeholder={field.placeholder} maxLength={field.maxLength}
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
                <button onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-charcoal-50 transition-colors text-charcoal-700">+</button>
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
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 border-2 border-charcoal-950 text-charcoal-950 flex items-center justify-center gap-3 py-4 text-sm font-medium hover:bg-charcoal-950 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
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

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="flex border-b border-charcoal-200">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-8 py-4 text-sm font-sans font-medium tracking-wide transition-colors relative',
                  tab === t ? 'text-charcoal-950' : 'text-charcoal-400 hover:text-charcoal-700',
                )}
              >
                {t}
                {t === 'Reviews' && product.reviewCount > 0 && (
                  <span className="ml-1.5 text-xs bg-charcoal-100 text-charcoal-600 px-1.5 py-0.5 rounded-full">{product.reviewCount}</span>
                )}
                {tab === t && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-950" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="py-10"
            >
              {tab === 'Description' && (
                <div className="max-w-2xl prose prose-charcoal font-sans text-charcoal-700 leading-relaxed">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : product.shortDescription ? (
                    <p>{product.shortDescription}</p>
                  ) : (
                    <p className="text-charcoal-400 italic">No description provided.</p>
                  )}
                </div>
              )}

              {tab === 'Details' && (
                <div className="max-w-2xl">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'SKU', value: product.sku },
                      { label: 'Category', value: product.category?.replace(/-/g, ' ') },
                      { label: 'Weight', value: product.weight ? `${product.weight}g` : null },
                      { label: 'Dimensions', value: product.dimensions ? `${product.dimensions.l}×${product.dimensions.w}×${product.dimensions.h} cm` : null },
                      { label: 'Materials', value: product.materials?.join(', ') },
                      { label: 'Care Instructions', value: product.careInstructions },
                      { label: 'Personalizable', value: product.isPersonalizable ? 'Yes — add your message' : 'No' },
                      { label: 'Made In', value: 'India 🇮🇳' },
                    ].filter(r => r.value).map(({ label, value }) => (
                      <div key={label} className="flex gap-3 py-3 border-b border-charcoal-100">
                        <span className="text-xs text-charcoal-400 uppercase tracking-wide font-sans w-32 flex-shrink-0">{label}</span>
                        <span className="text-sm text-charcoal-700 font-sans capitalize">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'Reviews' && (
                <div className="max-w-2xl space-y-8">
                  {/* Summary */}
                  {product.reviewCount > 0 && (
                    <div className="flex items-center gap-8 p-6 bg-cream-50 border border-charcoal-100">
                      <div className="text-center">
                        <p className="font-serif text-5xl text-charcoal-950">{product.rating?.toFixed(1)}</p>
                        <div className="flex gap-0.5 justify-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} className={cn(i < Math.round(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-charcoal-200')} />
                          ))}
                        </div>
                        <p className="text-xs text-charcoal-400 font-sans mt-1">{product.reviewCount} reviews</p>
                      </div>
                    </div>
                  )}

                  {/* Reviews list */}
                  <div className="space-y-6">
                    {reviews.length === 0 ? (
                      <p className="text-charcoal-400 font-sans text-sm text-center py-6">No reviews yet. Be the first to share your experience!</p>
                    ) : (
                      reviews.map((r: any) => (
                        <div key={r._id || r.id} className="border-b border-charcoal-100 pb-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-charcoal-200 flex items-center justify-center text-xs font-bold text-charcoal-700">
                                {(r.user?.name || 'A')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-sans font-medium text-charcoal-900 text-sm">{r.user?.name || 'Anonymous'}</p>
                                <p className="text-xs text-charcoal-400 font-sans">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} className={cn(i < r.rating ? 'fill-gold-400 text-gold-400' : 'text-charcoal-200')} />
                              ))}
                            </div>
                          </div>
                          <p className="font-sans text-sm text-charcoal-700 leading-relaxed">{r.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Write a Review */}
                  <div className="border-t border-charcoal-200 pt-8">
                    <h3 className="font-serif text-xl text-charcoal-950 mb-5">Write a Review</h3>
                    {!isAuthenticated ? (
                      <p className="text-charcoal-500 font-sans text-sm">
                        <Link to="/login" className="text-gold-600 underline">Login</Link> to write a review.
                      </p>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs text-charcoal-500 uppercase tracking-wide font-sans mb-2">Your Rating</label>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseEnter={() => setHoverRating(i + 1)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setReviewRating(i + 1)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  size={24}
                                  className={cn(
                                    'transition-colors',
                                    i < (hoverRating || reviewRating) ? 'fill-gold-400 text-gold-400' : 'text-charcoal-200',
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-charcoal-500 uppercase tracking-wide font-sans mb-2">Your Review</label>
                          <textarea
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            rows={4}
                            placeholder="Share your experience with this product…"
                            className="w-full border border-charcoal-200 px-4 py-3 text-sm font-sans focus:outline-none focus:border-charcoal-400 resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={reviewMutation.isPending}
                          className="btn-primary flex items-center gap-2 px-8 py-3 text-sm disabled:opacity-60"
                        >
                          <Send size={14} /> {reviewMutation.isPending ? 'Submitting…' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Related products */}
        {related?.length > 0 && (
          <div className="mt-16 border-t border-charcoal-100 pt-16">
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

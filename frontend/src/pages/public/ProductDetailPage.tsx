import { useState, useEffect, useRef } from 'react';
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
import { Heart, ShoppingBag, Star, Truck, Shield, RefreshCw, ChevronRight, ChevronLeft, Send, Leaf, Sparkles, Recycle } from 'lucide-react';
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

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isDown = false;

    const playCarousel = () => {
      if (carouselRef.current && !isDown) {
        carouselRef.current.scrollLeft += 1;
        if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth - carouselRef.current.clientWidth) {
           carouselRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(playCarousel);
    };
    
    animationFrameId = requestAnimationFrame(playCarousel);

    const handleMouseUp = () => { isDown = false; };
    const handleMouseDown = () => { isDown = true; };

    if (carouselRef.current) {
      carouselRef.current.addEventListener('mousedown', handleMouseDown);
      carouselRef.current.addEventListener('mouseup', handleMouseUp);
      carouselRef.current.addEventListener('mouseleave', handleMouseUp);
      carouselRef.current.addEventListener('touchstart', handleMouseDown, { passive: true });
      carouselRef.current.addEventListener('touchend', handleMouseUp, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (carouselRef.current) {
        carouselRef.current.removeEventListener('mousedown', handleMouseDown);
        carouselRef.current.removeEventListener('mouseup', handleMouseUp);
        carouselRef.current.removeEventListener('mouseleave', handleMouseUp);
        carouselRef.current.removeEventListener('touchstart', handleMouseDown);
        carouselRef.current.removeEventListener('touchend', handleMouseUp);
      }
    };
  }, []);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLImageElement>) => {
    e.currentTarget.style.transformOrigin = 'center center';
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

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* ── IMAGES GALLERY ── */}
          <div className="lg:col-span-6 w-full">
            {/* Mobile Swipeable Gallery */}
            <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 gap-4">
              {images.map((img: string, i: number) => (
                <div key={i} className="flex-shrink-0 w-[85vw] snap-center aspect-[4/5] bg-cream-50 rounded-2xl overflow-hidden relative">
                  <img src={img} alt={`${product.title} - ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                    {images.map((_: string, idx: number) => (
                      <div key={idx} className={cn("w-1.5 h-1.5 rounded-full transition-colors", idx === i ? "bg-white" : "bg-white/40")} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Stacked Gallery */}
            <div className="hidden lg:grid gap-4 sm:gap-6">
              {images.length === 1 ? (
                <div className="aspect-square bg-[#FAF7F2] overflow-hidden rounded-[2rem] relative group cursor-zoom-in">
                  
                  {/* Crazy Idea 1 & 2: Floating Badges & Hotspots */}
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                    <div className="bg-charcoal-950 text-white px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold shadow-lg">
                      Bestseller
                    </div>
                    {product.stock <= 5 && (
                      <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold shadow-lg animate-pulse">
                        Low Stock
                      </div>
                    )}
                  </div>
                  
                  {/* Hotspots */}
                  <div className="absolute top-[35%] left-[25%] z-20 group/hotspot">
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse border-2 border-[#D4A853]" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold text-charcoal-800 opacity-0 group-hover/hotspot:opacity-100 transition-opacity pointer-events-none shadow-xl border border-[#D4A853]/20 flex items-center gap-2">
                      <Sparkles size={12} className="text-[#D4A853]"/> 100% Hand-Poured
                    </div>
                  </div>
                  <div className="absolute top-[65%] right-[25%] z-20 group/hotspot">
                    <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse border-2 border-[#D4A853]" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold text-charcoal-800 opacity-0 group-hover/hotspot:opacity-100 transition-opacity pointer-events-none shadow-xl border border-[#D4A853]/20 flex items-center gap-2">
                      <Leaf size={12} className="text-[#D4A853]"/> Organic Ingredients
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 shadow-sm pointer-events-none">
                    <Sparkles size={12} className="text-[#D4A853]" /> Hover to Explore
                  </div>
                  <img 
                    src={images[0]} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.35]" 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 aspect-square bg-[#FAF7F2] overflow-hidden rounded-[2rem] relative group cursor-zoom-in">
                  
                    {/* Floating Badges & Hotspots */}
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                      <div className="bg-charcoal-950 text-white px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold shadow-lg">
                        Bestseller
                      </div>
                      {product.stock <= 5 && (
                        <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold shadow-lg animate-pulse">
                          Low Stock
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-[35%] left-[25%] z-20 group/hotspot">
                      <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse border-2 border-[#D4A853]" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold text-charcoal-800 opacity-0 group-hover/hotspot:opacity-100 transition-opacity pointer-events-none shadow-xl border border-[#D4A853]/20 flex items-center gap-2">
                        <Sparkles size={12} className="text-[#D4A853]"/> 100% Hand-Poured
                      </div>
                    </div>
                    <div className="absolute top-[65%] right-[25%] z-20 group/hotspot">
                      <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse border-2 border-[#D4A853]" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold text-charcoal-800 opacity-0 group-hover/hotspot:opacity-100 transition-opacity pointer-events-none shadow-xl border border-[#D4A853]/20 flex items-center gap-2">
                        <Leaf size={12} className="text-[#D4A853]"/> Organic Ingredients
                      </div>
                    </div>

                    <div className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 shadow-sm pointer-events-none">
                      <Sparkles size={12} className="text-[#D4A853]" /> Hover to Explore
                    </div>
                    <img 
                      src={images[0]} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.35]" 
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                  </div>
                  {images.slice(1).map((img: string, i: number) => (
                    <div key={i} className="aspect-[4/5] bg-[#FAF7F2] overflow-hidden rounded-[1.5rem] relative group cursor-zoom-in">
                      <img 
                        src={img} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.35]" 
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── PRODUCT DETAILS (Sticky) ── */}
          <div className="lg:col-span-6 w-full space-y-8 lg:sticky lg:top-32 lg:pb-12 lg:pl-4">

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {/* Crazy Idea 3: Urgency Banner */}
              <div className="flex items-center gap-2 mb-4 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full w-max border border-orange-200 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-sans tracking-widest uppercase font-bold">14 people are viewing this right now</span>
              </div>
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

            {/* Crazy Idea 4: Delivery Estimate Widget */}
            <div className="flex items-center gap-3 p-4 bg-[#FAF7F2] rounded-xl border border-[#D4A853]/20 shadow-inner">
              <Truck size={20} className="text-[#D4A853]" />
              <div className="flex-1">
                <p className="text-xs font-sans text-charcoal-900 font-semibold mb-0.5">Order within <span className="text-[#D4A853]">2 hrs 14 mins</span></p>
                <p className="text-[10px] font-sans text-charcoal-500 uppercase tracking-wider">For delivery by <span className="font-bold">Thursday</span></p>
              </div>
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="font-sans text-charcoal-600 leading-relaxed pt-2">{product.shortDescription}</p>
            )}

            {/* Personalization fields */}
            {product.isPersonalizable && product.personalizationFields?.length > 0 && (
              <div className="border border-[#D4A853]/30 bg-gradient-to-b from-[#FAF7F2] to-white p-6 rounded-2xl shadow-sm space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-[#D4A853]" size={18} strokeWidth={1.5} />
                  <p className="font-serif text-lg text-charcoal-900">Personalize Your Gift</p>
                </div>
                {product.personalizationFields.map((field: any) => (
                  <div key={field.key} className="space-y-2">
                    <label className="block text-[11px] font-sans text-charcoal-500 uppercase tracking-widest font-semibold">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        onChange={(e) => setPersonalization(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full bg-white border border-charcoal-200 rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-shadow resize-none h-24 placeholder:text-charcoal-300"
                      />
                    ) : field.type === 'select' ? (
                      <div className="relative">
                        <select onChange={(e) => setPersonalization(p => ({ ...p, [field.key]: e.target.value }))} className="w-full bg-white border border-charcoal-200 rounded-xl px-4 py-3.5 text-sm font-sans focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-shadow appearance-none cursor-pointer">
                          <option value="" disabled selected>Select {field.label}</option>
                          {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronRight size={14} className="text-charcoal-400 rotate-90" />
                        </div>
                      </div>
                    ) : (
                      <input type="text" placeholder={field.placeholder} maxLength={field.maxLength}
                        onChange={(e) => setPersonalization(p => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full bg-white border border-charcoal-200 rounded-xl px-4 py-3.5 text-sm font-sans focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853] transition-shadow placeholder:text-charcoal-300"
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
        </div>

        {/* ── Tabs Section ── */}
        <div className="mt-24 lg:mt-32 max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* Segmented Pill Control */}
          <div className="flex justify-center mb-10 sm:mb-16">
            <div className="inline-flex items-center p-1.5 bg-[#FAF7F2] rounded-full border border-[#D4A853]/20 shadow-inner overflow-x-auto no-scrollbar max-w-full">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'relative px-6 sm:px-10 py-3 text-[11px] sm:text-xs font-sans tracking-[0.2em] uppercase rounded-full transition-colors duration-300 whitespace-nowrap',
                    tab === t ? 'text-charcoal-950 font-bold' : 'text-charcoal-400 hover:text-charcoal-600 font-medium',
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t}
                    {t === 'Reviews' && product.reviewCount > 0 && (
                      <span className="text-[9px] bg-white text-charcoal-600 px-1.5 py-0.5 rounded-full shadow-sm border border-charcoal-100">{product.reviewCount}</span>
                    )}
                  </span>
                  {tab === t && (
                    <motion.div layoutId="tab-pill" className="absolute inset-0 bg-white rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.04)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="pb-12 sm:pb-16"
            >
              {tab === 'Description' && (
                <div className="max-w-3xl mx-auto">
                  <div className="text-center font-serif text-2xl sm:text-[28px] text-charcoal-800 leading-relaxed sm:leading-[1.8]">
                    <span className="text-[#D4A853] text-4xl sm:text-5xl mr-2 font-serif align-top leading-none">"</span>
                    {product.description ? (
                      <span dangerouslySetInnerHTML={{ __html: product.description.replace(/<[^>]+>/g, '') }} />
                    ) : product.shortDescription ? (
                      <span>{product.shortDescription}</span>
                    ) : (
                      <span className="italic text-charcoal-400">No description provided.</span>
                    )}
                    <span className="text-[#D4A853] text-4xl sm:text-5xl ml-2 font-serif align-bottom leading-none">"</span>
                  </div>
                  
                  {/* Editorial Badges */}
                  <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 text-center border-t border-[#D4A853]/20 pt-12">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center mb-4 text-[#D4A853]">
                        <Leaf size={20} strokeWidth={1.5} />
                      </div>
                      <h4 className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] text-charcoal-900 font-bold mb-1.5">100% Natural</h4>
                      <p className="font-sans text-[10px] sm:text-[11px] text-charcoal-400 hidden sm:block">Pure & organic</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center mb-4 text-[#D4A853]">
                        <Sparkles size={20} strokeWidth={1.5} />
                      </div>
                      <h4 className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] text-charcoal-900 font-bold mb-1.5">Handcrafted</h4>
                      <p className="font-sans text-[10px] sm:text-[11px] text-charcoal-400 hidden sm:block">Made with love</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center mb-4 text-[#D4A853]">
                        <Recycle size={20} strokeWidth={1.5} />
                      </div>
                      <h4 className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] text-charcoal-900 font-bold mb-1.5">Eco-Friendly</h4>
                      <p className="font-sans text-[10px] sm:text-[11px] text-charcoal-400 hidden sm:block">Sustainable</p>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'Details' && (
                <div className="max-w-3xl mx-auto">
                  <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
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

        {/* ── Related Products Carousel ── */}
        {related?.length > 0 && (
          <div className="mt-20 border-t border-charcoal-100 pt-16 mb-20 lg:mb-0">
            <h2 className="font-serif text-3xl text-charcoal-950 mb-8 text-center sm:text-left">You May Also Love</h2>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 no-scrollbar pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
              {related.map((p: any, i: number) => (
                <div key={p.id} className="snap-start flex-shrink-0 w-[280px] sm:w-[320px]">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Editorial Advertisement Carousel ── */}
      <div className="w-full overflow-hidden border-t border-charcoal-100 pt-16 sm:pt-24 pb-24 lg:pb-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 flex justify-between items-end">
          <h2 className="font-serif text-[32px] sm:text-[44px] text-charcoal-950 leading-[1.1]">
            Curated For <br className="sm:hidden" />
            <span className="italic text-charcoal-500 font-light text-[36px] sm:text-[50px]">You</span>
          </h2>
          <p className="hidden sm:block text-xs font-sans tracking-[0.25em] uppercase text-charcoal-400 font-semibold mb-2">
            Elva Lookbook
          </p>
        </div>
        <div className="relative group">
          {/* Scroll Buttons */}
          <button 
            className="hidden lg:flex absolute left-4 xl:left-12 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/90 backdrop-blur-md items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-charcoal-900 hover:scale-105" 
            onClick={() => document.getElementById('ad-carousel')?.scrollBy({ left: -450, behavior: 'smooth' })}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="hidden lg:flex absolute right-4 xl:right-12 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-white/90 backdrop-blur-md items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-charcoal-900 hover:scale-105" 
            onClick={() => document.getElementById('ad-carousel')?.scrollBy({ left: 450, behavior: 'smooth' })}
          >
            <ChevronRight size={24} />
          </button>

          <div 
            id="ad-carousel" 
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 sm:gap-8 pb-8 px-4 sm:px-8 lg:px-12 no-scrollbar"
          >
            {[
              { img: '/categories/elva_ad_candle_1779794926967.png', title: 'Signature Candles' },
              { img: '/categories/elva_ad_clay_1779794959182.png', title: 'Artisan Clay' },
              { img: '/categories/elva_ad_gift_1779794942965.png', title: 'Luxury Hampers' },
              { img: '/categories/cat_personalized_1779782786385.png', title: 'Bespoke Gifts' },
              { img: '/categories/cat_wedding_1779782802829.png', title: 'Wedding Edit' }
            ].map((item, i) => (
              <div key={i} className="flex-shrink-0 w-[85vw] sm:w-[400px] lg:w-[480px] aspect-[4/3] overflow-hidden rounded-[24px] group/card relative shadow-sm">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[1.5s] ease-[0.22,1,0.36,1]" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
                  <p className="text-[#D4A853] font-sans text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mb-2">Advertisement</p>
                  <h3 className="text-white font-serif text-2xl sm:text-3xl">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* ── Mobile Floating Buy Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-charcoal-100 p-4 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transform transition-transform duration-300">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="flex flex-col flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-charcoal-500 font-semibold mb-0.5">Total</span>
            <span className="font-sans font-bold text-lg text-charcoal-950 leading-none">₹{product.price?.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 btn-primary py-3.5 text-sm shadow-[0_10px_20px_rgba(212,168,83,0.3)] disabled:opacity-50 disabled:shadow-none"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}

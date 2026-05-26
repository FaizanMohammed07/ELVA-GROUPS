import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '@store/uiStore';
import { productsApi } from '@api/products.api';

const POPULAR_SEARCHES = [
  { label: 'Premium Candles', image: '/categories/cat_candles_1779782736599.png' },
  { label: 'Clay Art',        image: '/categories/cat_clay_1779782751534.png' },
  { label: 'Luxury Hampers',  image: '/categories/cat_hampers_1779782767460.png' },
  { label: 'Personalized',    image: '/categories/cat_personalized_1779782786385.png' },
  { label: 'Wedding Gifts',   image: '/categories/cat_wedding_1779782802829.png' },
  { label: 'Corporate Gifts', image: '/categories/cat_corporate_1779787626020.png' },
  { label: 'Home Decor',      image: '/categories/cat_decor_1779787643422.png' },
  { label: 'Diwali Specials', image: '/categories/cat_diwali_1779787659129.png' },
  { label: 'Anniversary',     image: '/categories/cat_anniversary_1779787678679.png' },
];

export const SearchOverlay = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Drag to scroll carousel state
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = false; // reset
    if (!carouselRef.current) return;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  };

  const handleMouseLeave = () => { isDragging.current = false; };
  const handleMouseUp = () => { 
    // Small delay before resetting isDragging to prevent click event
    setTimeout(() => { isDragging.current = false; }, 50); 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return; // Only run if left mouse button is pressed
    if (!carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    if (Math.abs(walk) > 5) isDragging.current = true; // threshold to differentiate click vs drag
    if (isDragging.current) {
      carouselRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await productsApi.getSuggestions(query);
        setSuggestions(data.data || []);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const executeSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      setQuery(searchTerm);
      closeSearch();
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: 'rgba(8, 2, 8, 0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,96,122,0.15) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%)' }} />

          <div className="relative max-w-4xl mx-auto w-full px-5 sm:px-8 pt-10 sm:pt-24 flex-1 flex flex-col h-full overflow-hidden">
            {/* Search Input Area */}
            <div className="relative border-b" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-6">
                <Search size={24} className="flex-shrink-0 sm:w-7 sm:h-7" style={{ color: '#D4A853' }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 font-display text-3xl sm:text-5xl bg-transparent focus:outline-none placeholder-white/20 text-white"
                  style={{ letterSpacing: '-0.02em', minWidth: 0 }}
                />
                <button type="button" onClick={closeSearch} className="p-1 sm:p-2 rounded-full hover:bg-white/5 transition-colors group">
                  <X size={28} className="text-white/50 group-hover:text-white transition-colors sm:w-8 sm:h-8" />
                </button>
              </form>
              {/* Animated underline */}
              <motion.div className="absolute bottom-[-1px] left-0 h-[2px]"
                initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.2, duration: 0.8 }}
                style={{ background: 'linear-gradient(to right, #C4607A, #D4A853, transparent)' }} />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pt-8 pb-32">
              {query.length >= 2 ? (
                <div className="animate-fade-in">
                  {loading ? (
                    <div className="flex items-center gap-3 text-white/40 font-sans">
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-[#D4A853] animate-spin" />
                      Searching...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-sans tracking-[0.25em] uppercase text-white/30 mb-6">Results</p>
                      {suggestions.map((item, i) => (
                        <motion.div key={item.slug} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                          <Link
                            to={`/products/${item.slug}`}
                            onClick={closeSearch}
                            className="group flex items-center gap-5 p-3 sm:p-4 rounded-xl hover:bg-white/5 transition-all duration-300"
                          >
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt={item.title} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                            ) : (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                <Search size={20} className="text-white/20" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-sans text-white text-base sm:text-lg group-hover:text-[#D4A853] transition-colors">{item.title}</h4>
                              <p className="font-display text-[#C4607A] text-sm mt-1">₹{item.price}</p>
                            </div>
                            <ArrowRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </Link>
                        </motion.div>
                      ))}
                      <button
                        onClick={() => executeSearch(query)}
                        className="inline-flex items-center gap-3 mt-6 text-sm font-sans tracking-wider uppercase text-[#D4A853] hover:text-white transition-colors"
                      >
                        View all results <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm font-sans">No results found for "{query}"</p>
                  )}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pb-10">
                  <p className="text-[10px] sm:text-xs font-sans text-white/30 tracking-[0.3em] uppercase mb-8">Popular Categories</p>
                  
                  {/* Beautiful Carousel for Popular Searches */}
                  <div className="relative group/carousel">
                    <div 
                      ref={carouselRef}
                      className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 no-scrollbar pr-10 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                      onMouseDown={handleMouseDown}
                      onMouseLeave={handleMouseLeave}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                    >
                      {POPULAR_SEARCHES.map((s, i) => (
                        <motion.button
                          key={s.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                          onClick={() => {
                            if (!isDragging.current) executeSearch(s.label);
                          }}
                          className="relative group flex-shrink-0 w-32 h-40 sm:w-40 sm:h-52 rounded-2xl overflow-hidden snap-start select-none"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {/* Fallback color and image */}
                          <div className="absolute inset-0 bg-[#1A0812]" />
                          <img src={s.image} alt={s.label} draggable={false} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-none" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                          
                          <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
                            <span className="block font-sans text-[10px] sm:text-xs tracking-wider uppercase text-white font-medium drop-shadow-md">
                              {s.label}
                            </span>
                          </div>
                          
                          {/* Hover glow */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(212,168,83,0.5)' }} />
                        </motion.button>
                      ))}
                    </div>
                    {/* Fade overlay on the right to indicate scroll */}
                    <div className="absolute top-0 right-0 bottom-8 w-16 pointer-events-none" style={{ background: 'linear-gradient(to right, transparent, rgba(8,2,8,0.95))' }} />
                  </div>

                  {/* Text-based quick links */}
                  <div className="mt-8">
                     <p className="text-[10px] sm:text-xs font-sans text-white/30 tracking-[0.3em] uppercase mb-5">Trending Searches</p>
                     <div className="flex flex-wrap gap-3">
                       {['Corporate Gifts', 'Diwali Offers', 'Anniversary Specials', 'Under ₹999'].map((term) => (
                         <button
                           key={term}
                           onClick={() => executeSearch(term)}
                           className="px-5 py-2.5 rounded-full border text-xs font-sans tracking-wide transition-all"
                           style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.03)' }}
                           onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D4A853'; e.currentTarget.style.color = '#D4A853'; }}
                           onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                         >
                           {term}
                         </button>
                       ))}
                     </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

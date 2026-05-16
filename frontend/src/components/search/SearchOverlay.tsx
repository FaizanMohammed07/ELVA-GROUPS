import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUIStore } from '@store/uiStore';
import { productsApi } from '@api/products.api';

export const SearchOverlay = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-50 flex flex-col"
        >
          <div className="max-w-3xl mx-auto w-full px-4 pt-24">
            <div className="flex items-center gap-4 border-b-2 border-charcoal-950 pb-4">
              <Search size={24} className="text-charcoal-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, collections, gifts..."
                className="flex-1 font-display text-3xl text-charcoal-950 placeholder-charcoal-300 focus:outline-none bg-transparent"
              />
              <button onClick={closeSearch} className="p-2 hover:bg-charcoal-50 rounded">
                <X size={24} />
              </button>
            </div>

            {query.length >= 2 && (
              <div className="mt-6">
                {loading ? (
                  <p className="text-charcoal-400 text-sm font-sans">Searching...</p>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/products/${item.slug}`}
                        onClick={closeSearch}
                        className="flex items-center gap-4 p-3 hover:bg-cream-50 transition-colors"
                      >
                        {item.thumbnail && (
                          <img src={item.thumbnail} alt={item.title} className="w-12 h-14 object-cover bg-cream-100" />
                        )}
                        <span className="font-sans text-charcoal-800">{item.title}</span>
                      </Link>
                    ))}
                    <Link
                      to={`/search?q=${encodeURIComponent(query)}`}
                      onClick={closeSearch}
                      className="block text-center text-sm text-gold-600 font-medium py-3 hover:text-gold-700"
                    >
                      View all results for "{query}"
                    </Link>
                  </div>
                ) : (
                  <p className="text-charcoal-400 text-sm font-sans">No results found for "{query}"</p>
                )}
              </div>
            )}

            {query.length === 0 && (
              <div className="mt-8">
                <p className="text-xs font-sans text-charcoal-400 tracking-widest uppercase mb-4">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Candles', 'Personalized Gifts', 'Wedding Gifts', 'Corporate Gifts', 'Diwali Gifts', 'Anniversary'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-4 py-2 border border-charcoal-200 text-sm font-sans text-charcoal-700 hover:border-charcoal-950 hover:text-charcoal-950 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

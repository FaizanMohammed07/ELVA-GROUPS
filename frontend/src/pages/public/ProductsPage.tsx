import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productsApi } from '@api/products.api';
import { ProductCard } from '@components/products/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import { SEOHead } from '@components/seo/SEOHead';

const CATEGORIES = [
  { slug: 'premium-candles', label: 'Premium Candles' },
  { slug: 'personalized-gifts', label: 'Personalized Gifts' },
  { slug: 'clay-art', label: 'Clay Art' },
  { slug: 'home-decor', label: 'Home Decor' },
  { slug: 'couple-collections', label: 'Couple Collections' },
  { slug: 'wedding-collections', label: 'Wedding Collections' },
  { slug: 'festival-collections', label: 'Festival Collections' },
  { slug: 'corporate-gifting', label: 'Corporate Gifting' },
  { slug: 'luxury-hampers', label: 'Luxury Hampers' },
];

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { label: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: 999999 },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, sortBy, sortOrder, category: selectedCategory, priceMin: priceRange?.min, priceMax: priceRange?.max }],
    queryFn: () => productsApi.list({
      page, limit: 20, sortBy, sortOrder,
      category: selectedCategory || undefined,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
    }).then(r => {
      const result = r.data;
      setAllProducts(prev => page === 1 ? (result.data || []) : [...prev, ...(result.data || [])]);
      return result;
    }),
  });

  const meta = data?.meta;

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(prev => prev === slug ? '' : slug);
    setPage(1);
    setAllProducts([]);
  };

  const handlePriceRange = (range: typeof priceRange) => {
    setPriceRange(prev => prev?.min === range?.min ? null : range);
    setPage(1);
    setAllProducts([]);
  };

  const handleSort = (val: string) => {
    const [field, order] = val.split('-');
    setSortBy(field);
    setSortOrder(order as 'asc' | 'desc');
    setPage(1);
    setAllProducts([]);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange(null);
    setPage(1);
    setAllProducts([]);
  };

  const hasFilters = !!selectedCategory || !!priceRange;

  return (
    <>
      <SEOHead
        title="All Products — Handcrafted Gifts & Lifestyle | ELUNORA"
        description="Browse ELUNORA's full collection of premium handcrafted gifts. Personalized gifts, luxury candles, clay art, hampers & more. Free shipping on orders ₹999+."
        keywords="handcrafted gifts India, all products ELUNORA, buy handmade gifts, premium gifting India"
      />
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-4xl text-charcoal-950">All Products</h1>
            <p className="font-sans text-charcoal-500 mt-1 text-sm">{meta?.total || 0} products {selectedCategory && `in ${CATEGORIES.find(c => c.slug === selectedCategory)?.label}`}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 border px-4 py-2.5 text-sm font-sans transition-colors ${filterOpen || hasFilters ? 'border-charcoal-950 bg-charcoal-950 text-white' : 'border-charcoal-200 text-charcoal-700 hover:border-charcoal-950'}`}
            >
              <SlidersHorizontal size={15} />
              Filters {hasFilters && `(${[selectedCategory, priceRange].filter(Boolean).length})`}
            </button>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => handleSort(e.target.value)}
              className="border border-charcoal-200 px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-charcoal-400 bg-white"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="salesCount-desc">Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-charcoal-500 font-sans">Active filters:</span>
            {selectedCategory && (
              <span className="flex items-center gap-1 bg-charcoal-950 text-white text-xs px-3 py-1 rounded-full">
                {CATEGORIES.find(c => c.slug === selectedCategory)?.label}
                <button onClick={() => handleCategoryChange(selectedCategory)}><X size={10} /></button>
              </span>
            )}
            {priceRange && (
              <span className="flex items-center gap-1 bg-charcoal-950 text-white text-xs px-3 py-1 rounded-full">
                {PRICE_RANGES.find(r => r.min === priceRange.min)?.label}
                <button onClick={() => handlePriceRange(null)}><X size={10} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-sans underline">Clear all</button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <AnimatePresence>
            {filterOpen && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 240 }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div className="w-60 space-y-8">
                  {/* Category filter */}
                  <div>
                    <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3 font-sans">Category</h3>
                    <div className="space-y-1.5">
                      {CATEGORIES.map(cat => (
                        <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategory === cat.slug}
                            onChange={() => handleCategoryChange(cat.slug)}
                            className="w-3.5 h-3.5 accent-charcoal-950"
                          />
                          <span className={`text-sm font-sans transition-colors ${selectedCategory === cat.slug ? 'text-charcoal-950 font-medium' : 'text-charcoal-600 group-hover:text-charcoal-950'}`}>
                            {cat.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price filter */}
                  <div>
                    <h3 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3 font-sans">Price Range</h3>
                    <div className="space-y-1.5">
                      {PRICE_RANGES.map(range => (
                        <label key={range.label} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={priceRange?.min === range.min}
                            onChange={() => handlePriceRange({ min: range.min, max: range.max })}
                            className="w-3.5 h-3.5 accent-charcoal-950"
                          />
                          <span className={`text-sm font-sans transition-colors ${priceRange?.min === range.min ? 'text-charcoal-950 font-medium' : 'text-charcoal-600 group-hover:text-charcoal-950'}`}>
                            {range.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-sans underline w-full text-left">
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {isLoading && page === 1
                ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)
                : allProducts.map((p: any, i: number) => <ProductCard key={p.id || p._id} product={p} index={i} />)}
            </div>

            {isLoading && page > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)}
              </div>
            )}

            {!isLoading && allProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="font-sans text-charcoal-400 text-sm">No products found. Try adjusting your filters.</p>
                <button onClick={clearFilters} className="mt-4 btn-primary text-sm px-8 py-3">Clear Filters</button>
              </div>
            )}

            {meta?.hasNext && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={isLoading}
                  className="btn-outline px-12 py-3 disabled:opacity-50"
                >
                  {isLoading ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

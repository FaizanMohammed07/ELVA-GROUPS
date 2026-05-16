import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@api/products.api';
import { ProductCard } from '@components/products/ProductCard';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const q = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => productsApi.search(q).then(r => r.data),
    enabled: q.length > 1,
  });

  const products = data?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="font-serif text-4xl text-charcoal-950 text-center mb-6">Search</h1>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, collections..."
              className="w-full border border-charcoal-200 px-5 py-4 pr-14 font-sans text-charcoal-950 focus:outline-none focus:border-charcoal-950 transition-colors text-lg"
              autoFocus
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-950 transition-colors">
              <Search size={22} />
            </button>
          </form>
        </div>

        {q && (
          <div>
            <div className="mb-6">
              {isLoading ? (
                <p className="font-sans text-charcoal-500">Searching...</p>
              ) : (
                <p className="font-sans text-charcoal-500">
                  {products.length > 0 ? `${products.length} results for "${q}"` : `No results found for "${q}"`}
                </p>
              )}
            </div>

            {products.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <Search size={48} className="text-charcoal-200 mx-auto mb-4" />
                <h2 className="font-serif text-2xl text-charcoal-950 mb-2">No results found</h2>
                <p className="font-sans text-charcoal-500">Try different keywords or browse our collections.</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)
                : products.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}

        {!q && (
          <div className="text-center py-12">
            <p className="font-sans text-charcoal-400">Start typing to search our collection...</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '@api/products.api';
import { ProductCard } from '@components/products/ProductCard';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, sortBy, sortOrder, category: searchParams.get('category') }],
    queryFn: () => productsApi.list({ page, limit: 20, sortBy, sortOrder, category: searchParams.get('category') || undefined }).then(r => r.data),
  });

  const products = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-charcoal-950">All Products</h1>
            <p className="font-sans text-charcoal-500 mt-1">{meta?.total || 0} products</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="border border-charcoal-200 px-3 py-2 text-sm font-sans focus:outline-none"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="salesCount-desc">Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] skeleton" />
              ))
            : products.map((p: any, i: number) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
        </div>

        {meta && meta.hasNext && (
          <div className="text-center mt-12">
            <button onClick={() => setPage(p => p + 1)} className="btn-outline px-12">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

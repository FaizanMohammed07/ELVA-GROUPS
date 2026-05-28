import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { productsApi } from '@api/products.api';
import { ProductCard } from '@components/products/ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import { SEOHead } from '@components/seo/SEOHead';

const CATEGORY_META: Record<string, { title: string; description: string; hero: string }> = {
  'premium-candles': { title: 'Premium Candles', description: 'Hand-poured luxury candles crafted with natural waxes and exotic fragrances.', hero: '/categories/candles.jpg' },
  'personalized-gifts': { title: 'Personalized Gifts', description: 'One-of-a-kind gifts crafted with your personal touch.', hero: '/categories/personalized.jpg' },
  'clay-art': { title: 'Clay Art', description: 'Handcrafted clay sculptures and decorative pieces.', hero: '/categories/clay.jpg' },
  'home-decor': { title: 'Home Decor', description: 'Elevate your living spaces with artisanal home accents.', hero: '/categories/decor.jpg' },
  'couple-collections': { title: 'Couple Collections', description: 'Celebrate love with our curated couple collections.', hero: '/categories/couple.jpg' },
  'wedding-collections': { title: 'Wedding Collections', description: 'Make every wedding moment extraordinary.', hero: '/categories/wedding.jpg' },
  'festival-collections': { title: 'Festival Collections', description: 'Celebrate every festival with premium gifting.', hero: '/categories/festival.jpg' },
  'corporate-gifting': { title: 'Corporate Gifting', description: 'Premium corporate gifts that leave a lasting impression.', hero: '/categories/corporate.jpg' },
  'luxury-hampers': { title: 'Luxury Hampers', description: 'Curated luxury hampers for every occasion.', hero: '/categories/hampers.jpg' },
  'subscription-boxes': { title: 'Subscription Boxes', description: 'Monthly curated boxes of handcrafted treasures.', hero: '/categories/subscription.jpg' },
  'limited-edition': { title: 'Limited Edition', description: 'Exclusive drops available for a limited time only.', hero: '/categories/limited.jpg' },
  'creator-collaborations': { title: 'Creator Collaborations', description: 'Unique collections from our artist collaborations.', hero: '/categories/collab.jpg' },
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const meta = CATEGORY_META[slug || ''] || { title: 'Collection', description: '', hero: '' };

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, sortBy, sortOrder, category: slug }],
    queryFn: () => productsApi.list({ page, limit: 20, sortBy, sortOrder, category: slug }).then(r => r.data),
    enabled: !!slug,
  });

  const products = data?.data || [];
  const pagination = data?.meta;

  return (
    <>
      <SEOHead
        title={`${meta.title} — Handcrafted Gifts | ELUNORA`}
        description={`${meta.description} Shop premium handcrafted ${meta.title.toLowerCase()} at ELUNORA. Free shipping on orders ₹999+.`}
        keywords={`${meta.title.toLowerCase()}, handcrafted ${meta.title.toLowerCase()}, ELUNORA ${meta.title.toLowerCase()}, buy ${meta.title.toLowerCase()} India`}
      />
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-charcoal-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/60 to-charcoal-950/80" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold-400 text-xs tracking-[0.4em] uppercase font-sans mb-3"
          >
            ELUNORA Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl text-white"
          >
            {meta.title}
          </motion.h1>
          {meta.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-sans text-charcoal-300 mt-3 max-w-lg text-sm"
            >
              {meta.description}
            </motion.p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8">
          <p className="font-sans text-charcoal-500 text-sm">{pagination?.total || 0} products</p>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
              setPage(1);
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)
            : products.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>

        {pagination?.hasNext && (
          <div className="text-center mt-12">
            <button onClick={() => setPage(p => p + 1)} className="btn-outline px-12">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

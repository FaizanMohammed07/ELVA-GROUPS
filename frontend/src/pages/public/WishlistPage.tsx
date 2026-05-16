import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useWishlistStore } from '@store/wishlistStore';
import { useCartStore } from '@store/cartStore';
import { productsApi } from '@api/products.api';
import { Heart, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { productIds, toggle } = useWishlistStore();
  const wishlistIds = Array.from(productIds);
  const { addItem } = useCartStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ['wishlist-products', wishlistIds],
    queryFn: async () => {
      if (wishlistIds.length === 0) return [];
      const results = await Promise.all(wishlistIds.map(id => productsApi.getById(id).then(r => r.data.data)));
      return results;
    },
    enabled: wishlistIds.length > 0,
  });

  if (wishlistIds.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <Heart size={64} className="text-charcoal-200 mb-6" />
        <h1 className="font-serif text-3xl text-charcoal-950 mb-3">Your wishlist is empty</h1>
        <p className="font-sans text-charcoal-500 mb-8">Save items you love to come back to them later.</p>
        <Link to="/products" className="btn-primary px-10 py-3">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-serif text-4xl text-charcoal-950">Wishlist</h1>
          <p className="font-sans text-charcoal-500 text-sm">{wishlistIds.length} items</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: wishlistIds.length }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton" />)
            : products?.map((product: any, i: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <Link to={`/products/${product.slug}`} className="block aspect-[3/4] overflow-hidden bg-cream-50 mb-3">
                  <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <button
                  onClick={() => toggle(product.id)}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm"
                >
                  <Heart size={16} className="fill-red-500 text-red-500" />
                </button>
                <h3 className="font-serif text-charcoal-950 mb-1 line-clamp-1">{product.title}</h3>
                <p className="font-sans font-semibold text-charcoal-950 text-sm mb-3">₹{product.price.toLocaleString('en-IN')}</p>
                <button
                  onClick={() => {
                    addItem({ productId: product.id, title: product.title, slug: product.slug, thumbnail: product.thumbnail, price: product.price, quantity: 1, stock: product.stock });
                    toast.success('Added to bag!');
                  }}
                  disabled={product.stock === 0}
                  className="w-full btn-outline py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag size={14} />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@api/orders.api';
import { Package, ChevronRight } from 'lucide-react';
import { cn } from '@utils/cn';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page],
    queryFn: () => ordersApi.myOrders({ page, limit: 10 }).then(r => r.data),
  });

  const orders = data?.data || [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="h-8 skeleton rounded w-48 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 skeleton rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <Package size={64} className="text-charcoal-200 mb-6" />
        <h1 className="font-serif text-3xl text-charcoal-950 mb-3">No orders yet</h1>
        <p className="font-sans text-charcoal-500 mb-8">Start shopping to see your orders here.</p>
        <Link to="/products" className="btn-primary px-10 py-3">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl text-charcoal-950 mb-10">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order: any) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block border border-charcoal-100 hover:border-charcoal-300 transition-colors p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-sans font-semibold text-charcoal-950 text-sm">#{order.orderNumber}</p>
                  <p className="font-sans text-xs text-charcoal-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-xs font-sans font-medium px-2 py-1 rounded-full', STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600')}>
                    {order.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                  <ChevronRight size={16} className="text-charcoal-400" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {order.items?.slice(0, 3).map((item: any) => (
                  <img key={item.productId} src={item.thumbnail} alt={item.title} className="w-12 h-16 object-cover bg-cream-50" />
                ))}
                {order.items?.length > 3 && (
                  <div className="w-12 h-16 bg-charcoal-100 flex items-center justify-center">
                    <span className="font-sans text-xs text-charcoal-500">+{order.items.length - 3}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <p className="font-sans text-xs text-charcoal-500">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                <p className="font-sans font-semibold text-charcoal-950">₹{order.total?.toLocaleString('en-IN')}</p>
              </div>
            </Link>
          ))}
        </div>

        {meta?.hasNext && (
          <div className="text-center mt-8">
            <button onClick={() => setPage(p => p + 1)} className="btn-outline px-10 py-3">Load More</button>
          </div>
        )}
      </div>
    </div>
  );
}

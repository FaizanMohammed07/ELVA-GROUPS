import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Wrench, Package } from 'lucide-react';
import { apiClient } from '@api/client';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Awaiting Quote', color: 'bg-amber-100 text-amber-700', icon: Clock },
  quoted: { label: 'Quote Sent', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  in_progress: { label: 'Being Crafted', color: 'bg-purple-100 text-purple-700', icon: Wrench },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: XCircle },
};

const CATEGORY_EMOJIS: Record<string, string> = {
  candles: '🕯️', 'clay-art': '🏺', hampers: '🎁', jewellery: '💎',
  'home-decor': '🏡', couple: '💑', corporate: '🤝', festival: '🪔',
};

export default function CustomOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-custom-orders'],
    queryFn: () => apiClient.get('/custom-orders/my').then((r) => r.data.data).catch(() => ({ orders: [] })),
  });

  const orders = data?.orders || data?.items || (Array.isArray(data) ? data : []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Custom Orders</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">Track your personalized creation requests</p>
        </div>
        <Link to="/custom-order" className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5"><Plus size={15} /> New Request</Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 skeleton" />)}</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center">
          <Package size={48} className="mx-auto mb-5 text-charcoal-200" />
          <h3 className="font-display text-xl text-charcoal-700 mb-2">No Custom Orders Yet</h3>
          <p className="text-charcoal-400 text-sm mb-6 max-w-xs mx-auto">Have something special in mind? Let our artisans craft it just for you.</p>
          <Link to="/custom-order" className="btn-primary text-sm py-3 px-6">Create Custom Order</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any, i: number) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            return (
              <motion.div key={order._id || order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white border border-charcoal-100 p-5">
                <div className="flex items-start gap-4">
                  {/* Category emoji */}
                  <div className="w-14 h-14 bg-cream-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {CATEGORY_EMOJIS[order.category] || '🎁'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-medium text-charcoal-900 capitalize">{order.category?.replace('-', ' ')} — Custom Request</p>
                        <p className="text-xs text-charcoal-400 mt-0.5">#{(order._id || order.id).slice(-8).toUpperCase()} · Submitted {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${status.color}`}>
                        <StatusIcon size={11} />{status.label}
                      </span>
                    </div>

                    <p className="text-sm text-charcoal-600 mt-2 line-clamp-2">{order.description}</p>

                    {/* Quote info */}
                    {order.quotedPrice && (
                      <div className="mt-3 flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-charcoal-400 text-xs">Quoted Price:</span>
                          <span className="font-semibold text-charcoal-900">₹{order.quotedPrice.toLocaleString('en-IN')}</span>
                        </div>
                        {order.estimatedDays && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-charcoal-400 text-xs">Est. Delivery:</span>
                            <span className="text-charcoal-700">{order.estimatedDays} days</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin note */}
                    {order.adminNote && (
                      <div className="mt-3 bg-cream-50 border-l-2 border-gold-400 pl-3 py-2">
                        <p className="text-xs text-charcoal-400 font-medium uppercase tracking-wide mb-0.5">Note from ELVA Team</p>
                        <p className="text-sm text-charcoal-700">{order.adminNote}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {order.status === 'quoted' && (
                      <div className="mt-4 flex gap-3">
                        <button className="px-4 py-2 bg-gold-500 text-white text-xs font-medium hover:bg-gold-600 transition-colors">Accept Quote</button>
                        <button className="px-4 py-2 border border-charcoal-200 text-charcoal-600 text-xs hover:bg-cream-50 transition-colors">Request Revision</button>
                      </div>
                    )}

                    {/* Images */}
                    {order.images?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {order.images.slice(0, 3).map((img: string, idx: number) => (
                          <img key={idx} src={img} alt="" className="w-12 h-12 object-cover bg-cream-100" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

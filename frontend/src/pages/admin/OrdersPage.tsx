import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, ExternalLink } from 'lucide-react';
import { ordersApi } from '@api/orders.api';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  returned: 'bg-rose-100 text-rose-600',
};

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusForm, setStatusForm] = useState({ status: '', trackingNumber: '', trackingUrl: '', note: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: () => ordersApi.list({ page, limit: 20, search, status: statusFilter || undefined }).then((r) => ({
      orders: r.data.data,
      total: r.data.meta?.total ?? r.data.data?.length ?? 0,
    })),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, ...rest }: any) => ordersApi.updateStatus(id, rest.status, rest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
      setSelectedOrder(null);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const openOrder = (order: any) => {
    setSelectedOrder(order);
    setStatusForm({ status: order.status, trackingNumber: order.trackingNumber || '', trackingUrl: order.trackingUrl || '', note: '' });
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatusMutation.mutate({ id: selectedOrder._id || selectedOrder.id, ...statusForm });
  };

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal-950">Orders</h1>
          <p className="text-sm text-charcoal-400 mt-0.5">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Order number, customer…" className="w-full pl-9 pr-4 py-2 border border-charcoal-200 bg-white text-sm focus:outline-none focus:border-charcoal-400" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="appearance-none border border-charcoal-200 bg-white px-4 pr-8 py-2 text-sm focus:outline-none focus:border-charcoal-400">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {[{ label: 'All', value: '' }, ...STATUSES.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))].map(({ label, value }) => (
          <button key={value} onClick={() => { setStatusFilter(value); setPage(1); }} className={`px-3 py-1 text-xs font-medium border transition-colors ${statusFilter === value ? 'bg-charcoal-950 text-white border-charcoal-950' : 'bg-white text-charcoal-600 border-charcoal-200 hover:border-charcoal-400'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-charcoal-100 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 skeleton" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-charcoal-50 border-b border-charcoal-100">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-sans font-medium text-charcoal-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {orders.map((o: any) => (
                <tr key={o._id || o.id} className="hover:bg-cream-50 cursor-pointer transition-colors" onClick={() => openOrder(o)}>
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-700">#{o.orderNumber || (o._id || o.id).slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-charcoal-900 font-medium">{o.user?.name || o.shippingAddress?.fullName || '—'}</p>
                    <p className="text-xs text-charcoal-400">{o.user?.email || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-charcoal-600">{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 font-medium text-charcoal-900">₹{(o.total || o.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[o.status] || 'bg-charcoal-100 text-charcoal-600'}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-charcoal-400">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-charcoal-400 text-xs">Update →</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-charcoal-400 text-sm">No orders found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-charcoal-400">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-charcoal-200 text-sm disabled:opacity-40 hover:bg-cream-50">Prev</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-charcoal-200 text-sm disabled:opacity-40 hover:bg-cream-50">Next</button>
          </div>
        </div>
      )}

      {/* Order Detail / Status Update Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="bg-white w-full sm:max-w-lg flex flex-col" style={{ maxHeight: '90vh' }}>
              <div className="flex items-center justify-between p-5 border-b border-charcoal-100 flex-shrink-0">
                <div>
                  <h2 className="font-display text-lg text-charcoal-950">Order #{selectedOrder.orderNumber || (selectedOrder._id || selectedOrder.id).slice(-6).toUpperCase()}</h2>
                  <p className="text-xs text-charcoal-400">{selectedOrder.user?.name} · {selectedOrder.user?.email}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-charcoal-400 hover:text-charcoal-700"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-5 space-y-5">
                {/* Items */}
                <div>
                  <p className="label-xs mb-3">Items</p>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cream-100 flex-shrink-0 overflow-hidden">
                          {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-charcoal-900">{item.title}</p>
                          <p className="text-xs text-charcoal-400">Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</p>
                        </div>
                        <p className="text-sm font-medium">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-cream-50 p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-charcoal-500">Subtotal</span><span>₹{(selectedOrder.subtotal || 0).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-charcoal-500">Shipping</span><span>{selectedOrder.shippingAmount > 0 ? `₹${selectedOrder.shippingAmount}` : 'Free'}</span></div>
                  {selectedOrder.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{selectedOrder.discountAmount}</span></div>}
                  <div className="flex justify-between font-semibold border-t border-charcoal-200 pt-1.5"><span>Total</span><span>₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span></div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <p className="label-xs mb-2">Shipping Address</p>
                    <p className="text-sm text-charcoal-700">{selectedOrder.shippingAddress.fullName}<br />{selectedOrder.shippingAddress.line1}{selectedOrder.shippingAddress.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ''}<br />{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                  </div>
                )}

                {/* Status Update Form */}
                <form onSubmit={handleUpdateStatus} className="space-y-4 border-t border-charcoal-100 pt-4">
                  <p className="label-xs">Update Status</p>
                  <div>
                    <select value={statusForm.status} onChange={(e) => setStatusForm(f => ({ ...f, status: e.target.value }))} className="input-field bg-white">
                      {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  {(statusForm.status === 'shipped' || statusForm.status === 'delivered') && (
                    <>
                      <div><label className="label-xs">Tracking Number</label><input value={statusForm.trackingNumber} onChange={(e) => setStatusForm(f => ({ ...f, trackingNumber: e.target.value }))} placeholder="AWB123456789" className="input-field" /></div>
                      <div><label className="label-xs">Tracking URL</label><input value={statusForm.trackingUrl} onChange={(e) => setStatusForm(f => ({ ...f, trackingUrl: e.target.value }))} placeholder="https://shiprocket.co/track/..." className="input-field" /></div>
                    </>
                  )}
                  <div><label className="label-xs">Note (optional)</label><textarea rows={2} value={statusForm.note} onChange={(e) => setStatusForm(f => ({ ...f, note: e.target.value }))} className="input-field resize-none" /></div>
                  <button type="submit" disabled={updateStatusMutation.isPending} className="btn-primary w-full py-2.5 text-xs disabled:opacity-60">
                    {updateStatusMutation.isPending ? 'Updating…' : 'Update Order Status'}
                  </button>
                </form>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

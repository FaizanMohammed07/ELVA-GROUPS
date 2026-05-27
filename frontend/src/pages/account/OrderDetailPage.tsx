import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@api/orders.api';
import { apiClient } from '@api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Package, Truck, MapPin, X, ExternalLink, Download, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@utils/cn';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => ordersApi.getById(id!).then(r => r.data.data),
    enabled: !!id,
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: () => ordersApi.cancel(id!, cancelReason || 'Customer requested cancellation'),
    onSuccess: () => {
      toast.success('Your order has been cancelled.');
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: () => toast.error('Unable to cancel this order. Please contact support.'),
  });

  const { mutate: requestReturn, isPending: isReturning } = useMutation({
    mutationFn: (reason: string) => apiClient.post(`/orders/my/${id}/return`, { reason }),
    onSuccess: () => {
      toast.success('Return request submitted. We\'ll be in touch within 24 hours.');
      setShowReturnModal(false);
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
    },
    onError: () => toast.error('Failed to submit return request'),
  });

  const handleDownloadInvoice = () => {
    apiClient.get(`/orders/${id}/invoice`, { responseType: 'blob' })
      .then(r => {
        const url = URL.createObjectURL(r.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order?.orderNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Invoice not available yet'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton" />)}
        </div>
      </div>
    );
  }

  if (!order) return null;

  const timeline = [
    { icon: CheckCircle, label: 'Order Placed', done: true },
    { icon: Package, label: 'Processing', done: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status) },
    { icon: Truck, label: 'Shipped', done: ['shipped', 'out_for_delivery', 'delivered'].includes(order.status) },
    { icon: MapPin, label: 'Delivered', done: order.status === 'delivered' },
  ];

  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const canReturn = order.status === 'delivered' && !order.returnRequested;

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <Link to="/account/orders" className="inline-flex items-center gap-2 text-charcoal-500 hover:text-charcoal-950 font-sans text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl text-charcoal-950">Order #{order.orderNumber}</h1>
            <p className="font-sans text-charcoal-500 text-sm mt-1">
              Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDownloadInvoice} className="flex items-center gap-1.5 border border-charcoal-200 px-3 py-2 text-xs text-charcoal-600 hover:bg-cream-50 transition-colors">
              <Download size={13} /> Invoice
            </button>
            {canCancel && (
              <button onClick={() => setShowCancelModal(true)} className="flex items-center gap-1.5 border border-red-300 text-red-600 px-3 py-2 text-xs hover:bg-red-50 transition-colors">
                <X size={13} /> Cancel Order
              </button>
            )}
            {canReturn && (
              <button onClick={() => setShowReturnModal(true)} className="flex items-center gap-1.5 border border-charcoal-200 text-charcoal-700 px-3 py-2 text-xs hover:bg-cream-50 transition-colors">
                <RefreshCw size={13} /> Return / Refund
              </button>
            )}
          </div>
        </div>

        {/* Return requested banner */}
        {order.returnRequested && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 mb-6">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm font-sans text-amber-700">Return request submitted. Our team will contact you within 24 hours.</p>
          </div>
        )}

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="bg-cream-50 p-6 mb-6">
            <div className="relative flex justify-between">
              {/* Connector line */}
              <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-charcoal-200 z-0" />
              <div
                className="absolute top-5 left-[10%] h-0.5 bg-charcoal-950 z-0 transition-all duration-700"
                style={{ width: `${(timeline.filter(t => t.done).length - 1) / (timeline.length - 1) * 80}%` }}
              />
              {timeline.map(({ icon: Icon, label, done }) => (
                <div key={label} className="flex flex-col items-center z-10 flex-1">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 transition-all duration-300', done ? 'bg-charcoal-950 border-charcoal-950' : 'bg-white border-charcoal-200')}>
                    <Icon size={18} className={done ? 'text-white' : 'text-charcoal-400'} />
                  </div>
                  <p className="font-sans text-xs text-charcoal-600 text-center leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="flex items-center justify-between p-4 border border-charcoal-100 bg-white mb-6">
            <div>
              <p className="text-xs text-charcoal-400 uppercase tracking-wider font-sans mb-0.5">Tracking Number</p>
              <p className="font-mono text-charcoal-950 font-medium">{order.trackingNumber}</p>
              {order.courier && <p className="text-xs text-charcoal-500 font-sans mt-0.5">via {order.courier}</p>}
            </div>
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gold-600 hover:text-gold-700 text-sm font-sans transition-colors">
                Track <ExternalLink size={13} />
              </a>
            )}
          </div>
        )}

        {/* Items */}
        <div className="border border-charcoal-100 mb-6">
          <div className="p-5 border-b border-charcoal-100">
            <h2 className="font-sans font-semibold text-charcoal-950 text-sm uppercase tracking-wider">Items Ordered</h2>
          </div>
          <div className="divide-y divide-charcoal-50">
            {order.items?.map((item: any) => (
              <div key={item.productId} className="flex gap-4 p-5">
                <img src={item.thumbnail || '/placeholder.svg'} alt={item.title} className="w-16 h-20 object-cover bg-cream-50 flex-shrink-0" />
                <div className="flex-1">
                  <Link to={`/products/${item.slug}`} className="font-sans font-medium text-charcoal-950 text-sm hover:text-gold-600 transition-colors">
                    {item.title}
                  </Link>
                  <p className="font-sans text-xs text-charcoal-500 mt-0.5">Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString('en-IN')}</p>
                  {item.personalization && Object.keys(item.personalization).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      {Object.entries(item.personalization).map(([k, v]) => (
                        <span key={k} className="text-[11px] text-charcoal-500 font-sans">{k}: <span className="text-charcoal-700">{v as string}</span></span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="font-sans font-semibold text-charcoal-950 text-sm whitespace-nowrap">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping */}
          <div className="border border-charcoal-100 p-5">
            <h2 className="font-sans font-semibold text-charcoal-950 text-sm uppercase tracking-wider mb-4">Delivery Address</h2>
            <p className="font-sans text-sm font-medium text-charcoal-700">{order.shippingAddress?.fullName}</p>
            <p className="font-sans text-sm text-charcoal-600 mt-1">{order.shippingAddress?.line1}</p>
            {order.shippingAddress?.line2 && <p className="font-sans text-sm text-charcoal-600">{order.shippingAddress.line2}</p>}
            <p className="font-sans text-sm text-charcoal-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
            <p className="font-sans text-xs text-charcoal-500 mt-2">📞 {order.shippingAddress?.phone}</p>
          </div>

          {/* Payment */}
          <div className="border border-charcoal-100 p-5">
            <h2 className="font-sans font-semibold text-charcoal-950 text-sm uppercase tracking-wider mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm font-sans text-charcoal-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount?.toLocaleString('en-IN')}</span></div>}
              {order.codCharge > 0 && <div className="flex justify-between"><span>COD Fee</span><span>₹{order.codCharge}</span></div>}
              <div className="flex justify-between font-semibold text-charcoal-950 border-t border-charcoal-100 pt-2 mt-2">
                <span>Total</span><span>₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className={cn('inline-flex px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-sans font-medium', order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                {order.paymentStatus || 'pending'}
              </span>
              <span className="text-xs text-charcoal-400 font-sans capitalize">{order.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCancelModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white max-w-md w-full overflow-hidden shadow-2xl"
            >
              {/* Red top bar */}
              <div className="h-1.5 bg-gradient-to-r from-red-400 to-red-600" />

              <div className="p-6">
                {/* Icon + heading */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-charcoal-950 leading-tight">Cancel this order?</h2>
                    <p className="font-sans text-xs text-charcoal-400 mt-0.5">Order #{order.orderNumber}</p>
                  </div>
                  <button onClick={() => setShowCancelModal(false)} className="ml-auto text-charcoal-300 hover:text-charcoal-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Warning message */}
                <div className="bg-red-50 border border-red-100 rounded px-4 py-3 mb-5">
                  <p className="font-sans text-sm text-red-700 leading-relaxed">
                    This action <span className="font-semibold">cannot be undone.</span> Your order will be permanently cancelled and any payment will be refunded within 5–7 business days.
                  </p>
                </div>

                {/* Items summary */}
                <div className="mb-5">
                  <p className="font-sans text-xs text-charcoal-400 uppercase tracking-wider mb-3">Items in this order</p>
                  <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                    {order.items?.map((item: any) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <img src={item.thumbnail || '/placeholder.svg'} alt={item.title} className="w-10 h-12 object-cover bg-cream-50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm text-charcoal-800 truncate">{item.title}</p>
                          <p className="font-sans text-xs text-charcoal-400">Qty {item.quantity} · ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional reason */}
                <div className="mb-6">
                  <label className="block font-sans text-xs text-charcoal-500 mb-1.5">Reason for cancellation <span className="text-charcoal-300">(optional)</span></label>
                  <select
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    className="w-full border border-charcoal-200 px-3 py-2.5 text-sm font-sans text-charcoal-700 focus:outline-none focus:border-charcoal-500 bg-white"
                  >
                    <option value="">Select a reason…</option>
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                    <option value="Shipping time is too long">Shipping time is too long</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 border border-charcoal-200 py-3 text-sm font-sans text-charcoal-700 hover:bg-cream-50 transition-colors"
                  >
                    Keep My Order
                  </button>
                  <button
                    onClick={() => cancelOrder()}
                    disabled={isCancelling}
                    className="flex-1 bg-red-600 text-white py-3 text-sm font-sans hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} className="bg-white p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl text-charcoal-950">Request Return / Refund</h2>
                <button onClick={() => setShowReturnModal(false)}><X size={18} className="text-charcoal-400" /></button>
              </div>
              <p className="font-sans text-sm text-charcoal-500 mb-4">Please describe the reason for your return. Our team will review and respond within 24 hours.</p>
              <textarea
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                rows={4}
                placeholder="e.g. Item arrived damaged, wrong item received, quality issue…"
                className="w-full border border-charcoal-200 px-4 py-3 text-sm font-sans focus:outline-none focus:border-charcoal-400 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => requestReturn(returnReason)}
                  disabled={!returnReason.trim() || isReturning}
                  className="flex-1 bg-charcoal-950 text-white py-3 text-sm font-sans hover:bg-charcoal-800 transition-colors disabled:opacity-50"
                >
                  {isReturning ? 'Submitting…' : 'Submit Request'}
                </button>
                <button onClick={() => setShowReturnModal(false)} className="flex-1 border border-charcoal-200 py-3 text-sm text-charcoal-700 hover:bg-cream-50">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

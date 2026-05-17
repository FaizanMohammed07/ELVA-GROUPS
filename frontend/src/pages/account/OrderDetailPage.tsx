import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@api/orders.api';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Package, Truck, MapPin, X } from 'lucide-react';
import { cn } from '@utils/cn';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => ordersApi.getById(id!).then(r => r.data.data),
    enabled: !!id,
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: () => ordersApi.cancel(id!),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
    },
    onError: () => toast.error('Cannot cancel this order'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton rounded" />)}
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

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/account/orders" className="inline-flex items-center gap-2 text-charcoal-500 hover:text-charcoal-950 font-sans text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-charcoal-950">Order #{order.orderNumber}</h1>
            <p className="font-sans text-charcoal-500 text-sm mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {['pending', 'confirmed'].includes(order.status) && (
            <button
              onClick={() => cancelOrder()}
              disabled={isCancelling}
              className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 text-sm font-sans hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <X size={14} /> Cancel Order
            </button>
          )}
        </div>

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="bg-cream-50 p-6 mb-6">
            <div className="flex justify-between">
              {timeline.map(({ icon: Icon, label, done }, idx) => (
                <div key={label} className="flex flex-col items-center flex-1">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center mb-2', done ? 'bg-charcoal-950' : 'bg-charcoal-200')}>
                    <Icon size={18} className={done ? 'text-white' : 'text-charcoal-400'} />
                  </div>
                  <p className="font-sans text-xs text-charcoal-600 text-center">{label}</p>
                  {idx < timeline.length - 1 && (
                    <div className={cn('absolute h-0.5 w-full top-5', done ? 'bg-charcoal-950' : 'bg-charcoal-200')} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="border border-charcoal-100 mb-6">
          <div className="p-5 border-b border-charcoal-100">
            <h2 className="font-sans font-semibold text-charcoal-950 text-sm uppercase tracking-wider">Items</h2>
          </div>
          <div className="divide-y divide-charcoal-100">
            {order.items?.map((item: any) => (
              <div key={item.productId} className="flex gap-4 p-5">
                <img src={item.thumbnail} alt={item.title} className="w-16 h-20 object-cover bg-cream-50 flex-shrink-0" />
                <div className="flex-1">
                  <Link to={`/products/${item.slug}`} className="font-sans font-medium text-charcoal-950 text-sm hover:text-gold-600 transition-colors">
                    {item.title}
                  </Link>
                  <p className="font-sans text-xs text-charcoal-500 mt-1">Qty: {item.quantity}</p>
                  {item.personalization && Object.keys(item.personalization).length > 0 && (
                    <div className="mt-1 text-xs text-charcoal-500 font-sans">
                      {Object.entries(item.personalization).map(([k, v]) => (
                        <span key={k} className="mr-3">{k}: {v as string}</span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="font-sans font-semibold text-charcoal-950 text-sm">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping */}
          <div className="border border-charcoal-100 p-5">
            <h2 className="font-sans font-semibold text-charcoal-950 text-sm uppercase tracking-wider mb-4">Delivery Address</h2>
            <p className="font-sans text-sm text-charcoal-700">{order.shippingAddress?.fullName}</p>
            <p className="font-sans text-sm text-charcoal-600">{order.shippingAddress?.line1}</p>
            {order.shippingAddress?.line2 && <p className="font-sans text-sm text-charcoal-600">{order.shippingAddress.line2}</p>}
            <p className="font-sans text-sm text-charcoal-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p className="font-sans text-sm text-charcoal-600 mt-1">📞 {order.shippingAddress?.phone}</p>
          </div>

          {/* Payment summary */}
          <div className="border border-charcoal-100 p-5">
            <h2 className="font-sans font-semibold text-charcoal-950 text-sm uppercase tracking-wider mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm font-sans text-charcoal-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount?.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between font-semibold text-charcoal-950 border-t border-charcoal-100 pt-2 mt-2">
                <span>Total</span><span>₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <p className="font-sans text-xs text-charcoal-400 mt-3 capitalize">Payment: {order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

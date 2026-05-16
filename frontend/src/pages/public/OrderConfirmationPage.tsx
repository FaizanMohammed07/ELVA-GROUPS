import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ordersApi } from '@api/orders.api';
import { CheckCircle, Package, Truck, MapPin } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => ordersApi.getByOrderNumber(orderNumber!).then(r => r.data.data),
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 skeleton rounded" />)}
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle size={72} className="text-green-500 mx-auto mb-6" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-gold-600 text-xs tracking-[0.4em] uppercase font-sans mb-3">Order Confirmed</p>
          <h1 className="font-serif text-4xl text-charcoal-950 mb-3">Thank You!</h1>
          <p className="font-sans text-charcoal-500 mb-2">Your order has been placed successfully.</p>
          <p className="font-sans font-semibold text-charcoal-950 text-lg mb-8">Order #{order.orderNumber}</p>
        </motion.div>

        {/* Timeline */}
        <div className="bg-cream-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-sans font-semibold text-charcoal-800 mb-4 text-sm uppercase tracking-wider">What's Next?</h2>
          <div className="space-y-4">
            {[
              { icon: CheckCircle, label: 'Order Placed', sub: 'We\'ve received your order', done: true },
              { icon: Package, label: 'Processing', sub: 'Your order is being prepared', done: order.status !== 'pending' },
              { icon: Truck, label: 'Shipped', sub: 'On its way to you', done: ['shipped', 'out_for_delivery', 'delivered'].includes(order.status) },
              { icon: MapPin, label: 'Delivered', sub: 'Delivered to your door', done: order.status === 'delivered' },
            ].map(({ icon: Icon, label, sub, done }) => (
              <div key={label} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-charcoal-100'}`}>
                  <Icon size={16} className={done ? 'text-green-600' : 'text-charcoal-400'} />
                </div>
                <div>
                  <p className="font-sans font-medium text-charcoal-950 text-sm">{label}</p>
                  <p className="font-sans text-xs text-charcoal-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order details */}
        <div className="bg-white border border-charcoal-100 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-sans font-semibold text-charcoal-800 mb-4 text-sm uppercase tracking-wider">Order Details</h2>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.productId} className="flex gap-3">
                <img src={item.thumbnail} alt={item.title} className="w-16 h-20 object-cover bg-cream-50 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium text-charcoal-950">{item.title}</p>
                  <p className="font-sans text-xs text-charcoal-500">Qty: {item.quantity}</p>
                  <p className="font-sans text-sm font-semibold text-charcoal-950 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-charcoal-100 mt-4 pt-4 flex justify-between font-sans font-semibold text-charcoal-950">
            <span>Total Paid</span>
            <span>₹{order.finalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/account/orders" className="btn-outline px-8 py-3">Track Orders</Link>
          <Link to="/products" className="btn-primary px-8 py-3">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

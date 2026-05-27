import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '@store/cartStore';
import { useAuthStore } from '@store/authStore';
import { ordersApi, paymentsApi } from '@api/orders.api';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid Indian mobile number required'),
  addressLine1: z.string().min(5, 'Address required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode required'),
  paymentMethod: z.enum(['razorpay', 'cod']),
  giftMessage: z.string().optional(),
  couponCode: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

declare const Razorpay: any;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, shippingCost, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const orderSubmittedRef = useRef(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      paymentMethod: 'razorpay',
    },
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => {
    if (items.length === 0 && !orderSubmittedRef.current) navigate('/cart', { replace: true });
  }, [items.length, navigate]);

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) return;
    setIsProcessing(true);
    try {
      const orderPayload = {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, personalization: i.personalization })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          line1: data.addressLine1,
          line2: data.addressLine2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: 'India',
        },
        paymentMethod: data.paymentMethod,
        giftMessage: data.giftMessage,
        couponCode: data.couponCode,
      };

      const orderRes = await ordersApi.create(orderPayload);
      const order = orderRes.data.data;

      if (data.paymentMethod === 'cod') {
        orderSubmittedRef.current = true;
        clearCart();
        navigate(`/order-confirmation/${order.orderNumber}`);
        return;
      }

      const razorpayRes = await paymentsApi.createRazorpayOrder(order.id);
      const rzpOrder = razorpayRes.data.data;

      if (typeof (window as any).Razorpay === 'undefined') {
        toast.error('Payment gateway failed to load. Please refresh and try again.');
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'ELVA',
        description: `Order #${order.orderNumber}`,
        order_id: rzpOrder.razorpayOrderId,
        prefill: { name: data.fullName, contact: data.phone, email: user?.email },
        theme: { color: '#1a1a1a' },
        handler: async (response: any) => {
          try {
            await paymentsApi.verify({
              orderId: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            orderSubmittedRef.current = true;
            clearCart();
            navigate(`/order-confirmation/${order.orderNumber}`);
          } catch {
            toast.error('Payment verification failed. Contact support with your order number.');
          }
        },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl text-charcoal-950 mb-10">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <div>
              <h2 className="font-sans font-semibold text-charcoal-950 mb-4 uppercase tracking-wider text-sm">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <input {...register('fullName')} placeholder="Full Name" className="input-luxury" />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1 font-sans">{errors.fullName.message}</p>}
                </div>
                <div className="col-span-2">
                  <input {...register('phone')} placeholder="Mobile Number" className="input-luxury" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.phone.message}</p>}
                </div>
                <div className="col-span-2">
                  <input {...register('addressLine1')} placeholder="Address Line 1" className="input-luxury" />
                  {errors.addressLine1 && <p className="text-red-500 text-xs mt-1 font-sans">{errors.addressLine1.message}</p>}
                </div>
                <div className="col-span-2">
                  <input {...register('addressLine2')} placeholder="Address Line 2 (Optional)" className="input-luxury" />
                </div>
                <div>
                  <input {...register('city')} placeholder="City" className="input-luxury" />
                  {errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
                </div>
                <div>
                  <input {...register('pincode')} placeholder="Pincode" className="input-luxury" />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1 font-sans">{errors.pincode.message}</p>}
                </div>
                <div className="col-span-2">
                  <input {...register('state')} placeholder="State" className="input-luxury" />
                  {errors.state && <p className="text-red-500 text-xs mt-1 font-sans">{errors.state.message}</p>}
                </div>
              </div>
            </div>

            {/* Gift Message */}
            <div>
              <h2 className="font-sans font-semibold text-charcoal-950 mb-4 uppercase tracking-wider text-sm">Gift Message (Optional)</h2>
              <textarea {...register('giftMessage')} placeholder="Write a personal message for the recipient..." className="input-luxury w-full resize-none h-24" />
            </div>

            {/* Payment */}
            <div>
              <h2 className="font-sans font-semibold text-charcoal-950 mb-4 uppercase tracking-wider text-sm">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'razorpay', label: 'Pay Online', sub: 'Cards, UPI, Net Banking, Wallets' },
                  { value: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive (+₹50 COD fee)' },
                ].map(({ value, label, sub }) => (
                  <label key={value} className="flex items-center gap-3 border border-charcoal-200 p-4 cursor-pointer hover:border-charcoal-950 transition-colors">
                    <input type="radio" value={value} {...register('paymentMethod')} className="accent-charcoal-950" />
                    <div>
                      <p className="font-sans font-medium text-charcoal-950 text-sm">{label}</p>
                      <p className="font-sans text-xs text-charcoal-500">{sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-10 lg:mt-0">
            <div className="bg-cream-50 p-6 space-y-4 sticky top-24">
              <h2 className="font-serif text-xl text-charcoal-950">Summary</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm font-sans text-charcoal-600">
                    <span className="truncate flex-1 mr-2">{item.title} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-charcoal-200 pt-4 space-y-3 text-sm font-sans">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span><span>₹{subtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Shipping</span>
                  <span>{shippingCost() === 0 ? <span className="text-green-600">FREE</span> : `₹${shippingCost()}`}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-charcoal-600">
                    <span>COD Fee</span><span>₹50</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-sans font-semibold text-charcoal-950 border-t border-charcoal-200 pt-4">
                <span>Total</span>
                <span>₹{(total() + (paymentMethod === 'cod' ? 50 : 0)).toLocaleString('en-IN')}</span>
              </div>
              <button type="submit" disabled={isProcessing} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                <Lock size={16} />
                {isProcessing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
              </button>
              <p className="text-center text-xs text-charcoal-400 font-sans">Secured by SSL encryption</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

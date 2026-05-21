import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '@store/cartStore';
import { apiClient } from '@api/client';
import { ShoppingBag, Trash2, Plus, Minus, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, shippingCost, total, couponCode, couponDiscount, applyCoupon, removeCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const r = await apiClient.post('/coupons/validate', { code: couponInput.trim().toUpperCase(), orderTotal: subtotal() });
      const { discount } = r.data.data;
      applyCoupon(couponInput.trim().toUpperCase(), discount);
      toast.success(`Coupon applied! You save ₹${discount}`);
      setCouponInput('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={64} className="text-charcoal-200 mb-6" />
        <h1 className="font-serif text-3xl text-charcoal-950 mb-3">Your bag is empty</h1>
        <p className="font-sans text-charcoal-500 mb-8">Discover our handcrafted collections and add something special.</p>
        <Link to="/products" className="btn-primary px-10 py-3">Explore Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl text-charcoal-950 mb-10">Shopping Bag</h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 border-b border-charcoal-100 pb-6"
              >
                <Link to={`/products/${item.slug}`} className="flex-shrink-0">
                  <img src={item.thumbnail} alt={item.title} className="w-24 h-32 object-cover bg-cream-50" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug}`} className="font-serif text-lg text-charcoal-950 hover:text-gold-600 transition-colors line-clamp-2">
                    {item.title}
                  </Link>
                  {item.personalization && Object.keys(item.personalization).length > 0 && (
                    <div className="mt-1 text-xs text-charcoal-500 font-sans">
                      {Object.entries(item.personalization).map(([k, v]) => (
                        <span key={k} className="mr-3">{k}: {v}</span>
                      ))}
                    </div>
                  )}
                  <p className="font-sans font-semibold text-charcoal-950 mt-2">₹{item.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-charcoal-200">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-charcoal-50 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-sans text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} className="w-8 h-8 flex items-center justify-center hover:bg-charcoal-50 transition-colors disabled:opacity-40">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-charcoal-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sans font-semibold text-charcoal-950">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-10 lg:mt-0">
            <div className="bg-cream-50 p-6 space-y-4 sticky top-24">
              <h2 className="font-serif text-xl text-charcoal-950">Order Summary</h2>

              {/* Coupon */}
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-green-700 font-sans font-medium">
                    <Tag size={13} /> {couponCode} · -₹{couponDiscount.toLocaleString('en-IN')}
                  </span>
                  <button onClick={removeCoupon} className="text-green-500 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Coupon code"
                    className="flex-1 border border-charcoal-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-charcoal-400 bg-white uppercase tracking-wider"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-charcoal-950 text-white px-4 py-2 text-xs font-sans hover:bg-charcoal-800 transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '…' : 'Apply'}
                  </button>
                </div>
              )}

              <div className="space-y-3 font-sans text-sm border-b border-charcoal-200 pb-4">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Shipping</span>
                  <span>{shippingCost() === 0 ? <span className="text-green-600">FREE</span> : `₹${shippingCost()}`}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-sans font-semibold text-charcoal-950">
                <span>Total</span>
                <span>₹{total().toLocaleString('en-IN')}</span>
              </div>
              {shippingCost() > 0 && subtotal() < 999 && (
                <p className="text-xs text-charcoal-500 font-sans">Add ₹{(999 - subtotal()).toLocaleString('en-IN')} more for free shipping</p>
              )}
              <Link to="/checkout" className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-2">
                Proceed to Checkout
              </Link>
              <Link to="/products" className="block text-center text-sm font-sans text-charcoal-500 hover:text-charcoal-950 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

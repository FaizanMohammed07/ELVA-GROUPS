import { useState } from 'react';
import { useUIStore } from '@store/uiStore';
import { useCartStore } from '@store/cartStore';
import { apiClient } from '@api/client';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUIStore();
  const { items, updateQuantity, removeItem, subtotal, shippingCost, total, couponCode, couponDiscount, applyCoupon, removeCoupon, itemCount } = useCartStore();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const r = await apiClient.post('/coupons/validate', { code: couponInput.trim().toUpperCase(), orderTotal: subtotal() });
      applyCoupon(couponInput.trim().toUpperCase(), r.data.data.discount);
      toast.success(`Coupon applied! -₹${r.data.data.discount}`);
      setCouponInput('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal-100 relative z-20">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="font-serif text-xl text-charcoal-950">Your Bag ({itemCount()})</h2>
              </div>
              <button onClick={(e) => { e.stopPropagation(); closeCart(); }} className="p-3 hover:bg-charcoal-50 rounded-full transition-colors relative z-50 cursor-pointer flex items-center justify-center">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center relative overflow-hidden rounded-2xl p-6" 
                  style={{ background: 'linear-gradient(160deg, #1E0812 0%, #2E1428 55%, #1A0820 100%)' }}>
                  {/* Glowing orbs for Gen-Z aesthetic */}
                  <div className="absolute top-[-10%] right-[-15%] w-60 h-60 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(196,96,122,0.4) 0%,transparent 70%)' }} />
                  <div className="absolute bottom-[-10%] left-[-15%] w-60 h-60 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(212,168,83,0.3) 0%,transparent 70%)' }} />
                  
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                    className="relative z-10 w-32 h-32 mb-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <ShoppingBag size={56} style={{ color: '#D4A853' }} />
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="absolute -top-2 -right-2 text-3xl"
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10 font-display text-3xl text-white mb-3"
                  >
                    Your bag is feeling light!
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 font-sans text-sm mb-8 px-4"
                    style={{ color: '#C8A8B8' }}
                  >
                    Discover our handcrafted collection and find something uniquely yours.
                  </motion.p>
                  
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: 0.4 }}
                    onClick={(e) => { e.stopPropagation(); closeCart(); navigate('/products'); }}
                    className="relative z-10 w-full py-4 text-sm font-semibold tracking-widest uppercase font-sans flex items-center justify-center gap-2"
                    style={{ background: '#D4A853', color: '#1E0812' }}
                  >
                    Explore Collection <Tag size={16} />
                  </motion.button>
                </div>

              ) : (
                items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 py-4 border-b border-charcoal-50">
                    <Link to={`/products/${item.slug}`} onClick={closeCart}>
                      <img src={item.thumbnail || '/placeholder.svg'} alt={item.title} className="w-20 h-24 object-cover bg-cream-50" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.slug}`} onClick={closeCart}>
                        <h3 className="font-sans text-sm font-medium text-charcoal-900 line-clamp-2">{item.title}</h3>
                      </Link>
                      <p className="font-sans text-charcoal-500 text-sm mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          className="w-7 h-7 border border-charcoal-200 flex items-center justify-center hover:border-charcoal-950 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-sans text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          className="w-7 h-7 border border-charcoal-200 flex items-center justify-center hover:border-charcoal-950 transition-colors disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="ml-2 text-charcoal-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="font-sans font-semibold text-sm whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-charcoal-100 px-6 py-5 space-y-4">
                {/* Coupon */}
                {couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded text-sm">
                    <span className="flex items-center gap-1.5 text-green-700 font-sans font-medium">
                      <Tag size={12} /> {couponCode} · -₹{couponDiscount}
                    </span>
                    <button onClick={removeCoupon} className="text-green-400 hover:text-red-500 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Coupon code"
                      className="flex-1 border border-charcoal-200 px-3 py-2 text-xs font-sans focus:outline-none focus:border-charcoal-400 uppercase tracking-wider"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="bg-charcoal-950 text-white px-3 py-2 text-xs font-sans hover:bg-charcoal-800 transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                )}

                <div className="space-y-2 text-sm font-sans">
                  <div className="flex justify-between text-charcoal-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-600">
                    <span>Shipping</span>
                    <span>{shippingCost() === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost()}`}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon</span>
                      <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-charcoal-950 border-t border-charcoal-100 pt-2">
                    <span>Total</span>
                    <span>₹{total().toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <Link to="/checkout" onClick={closeCart} className="btn-primary w-full text-center block py-3.5">
                  Proceed to Checkout
                </Link>
                <button onClick={closeCart} className="w-full text-center text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors font-sans">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

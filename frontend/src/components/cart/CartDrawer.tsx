import { useUIStore } from '@store/uiStore';
import { useCartStore } from '@store/cartStore';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUIStore();
  const { items, updateQuantity, removeItem, subtotal, shippingCost, total, itemCount } = useCartStore();

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
            <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="font-serif text-xl text-charcoal-950">Your Bag ({itemCount()})</h2>
              </div>
              <button onClick={closeCart} className="p-2 hover:bg-charcoal-50 rounded">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={48} className="text-charcoal-200" />
                  <p className="font-sans text-charcoal-500">Your bag is empty</p>
                  <button onClick={closeCart} className="btn-primary text-sm px-6 py-2.5">
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 py-4 border-b border-charcoal-50">
                    <Link to={`/products/${item.slug}`} onClick={closeCart}>
                      <img src={item.thumbnail} alt={item.title} className="w-20 h-24 object-cover bg-cream-50" />
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
                          className="w-7 h-7 border border-charcoal-200 flex items-center justify-center hover:border-charcoal-950 transition-colors"
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
                    <div className="text-right">
                      <p className="font-sans font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-charcoal-100 px-6 py-6 space-y-4">
                <div className="space-y-2 text-sm font-sans">
                  <div className="flex justify-between text-charcoal-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-600">
                    <span>Shipping</span>
                    <span>{shippingCost() === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost()}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-charcoal-950 border-t border-charcoal-100 pt-2">
                    <span>Total</span>
                    <span>₹{total().toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <Link to="/checkout" onClick={closeCart} className="btn-primary w-full text-center block py-3.5">
                  Proceed to Checkout
                </Link>
                <button onClick={closeCart} className="w-full text-center text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors">
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

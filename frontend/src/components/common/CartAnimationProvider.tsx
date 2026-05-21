import { createContext, useContext, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface FlyItem {
  id: string;
  src: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  type: 'heart' | 'spark';
}

interface CartAnimationContextValue {
  flyToCart: (imgSrc: string, fromEl: HTMLElement) => void;
  burstWishlist: (fromEl: HTMLElement) => void;
}

const CartAnimationContext = createContext<CartAnimationContextValue>({
  flyToCart: () => {},
  burstWishlist: () => {},
});

export const useCartAnimation = () => useContext(CartAnimationContext);

const SPARK_COLORS = ['#fbbf24', '#C9A96E', '#f59e0b', '#ffffff', '#fde68a'];
const HEART_COLORS = ['#f43f5e', '#fb7185', '#fda4af', '#C9A96E'];

export const CartAnimationProvider = ({ children }: { children: React.ReactNode }) => {
  const [flyItems, setFlyItems] = useState<FlyItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const cartIconRef = useRef<DOMRect | null>(null);

  const getCartIconRect = useCallback((): DOMRect | null => {
    const el = document.querySelector('[data-cart-icon]');
    return el ? el.getBoundingClientRect() : null;
  }, []);

  const flyToCart = useCallback((imgSrc: string, fromEl: HTMLElement) => {
    const rect = fromEl.getBoundingClientRect();
    const cartRect = getCartIconRect();
    if (!cartRect) return;

    const id = Math.random().toString(36).slice(2);
    setFlyItems((prev) => [
      ...prev,
      {
        id,
        src: imgSrc,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
      },
    ]);
    setTimeout(() => setFlyItems((prev) => prev.filter((f) => f.id !== id)), 900);

    // Bounce cart icon
    const cartEl = document.querySelector('[data-cart-icon]') as HTMLElement;
    if (cartEl) {
      cartEl.style.transform = 'scale(1.35)';
      setTimeout(() => { cartEl.style.transform = 'scale(1)'; }, 300);
    }
  }, [getCartIconRect]);

  const burstWishlist = useCallback((fromEl: HTMLElement) => {
    const rect = fromEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const newParticles: Particle[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: cx,
      y: cy,
      color: HEART_COLORS[i % HEART_COLORS.length],
      type: 'heart',
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((n) => n.id === p.id)));
    }, 800);
  }, []);

  return (
    <CartAnimationContext.Provider value={{ flyToCart, burstWishlist }}>
      {children}
      {createPortal(
        <div className="fixed inset-0 pointer-events-none z-[300]">
          <AnimatePresence>
            {flyItems.map((item) => (
              <motion.img
                key={item.id}
                src={item.src}
                alt=""
                initial={{ x: item.startX - 30, y: item.startY - 30, scale: 1, opacity: 1 }}
                animate={{ x: item.endX - 15, y: item.endY - 15, scale: 0.2, opacity: 0.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-14 h-14 object-cover rounded shadow-lg top-0 left-0"
                style={{ transform: 'translate(-50%, -50%)' }}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {particles.map((p, i) => {
              const angle = (i / 10) * Math.PI * 2;
              const dist = 35 + Math.random() * 30;
              return (
                <motion.div
                  key={p.id}
                  initial={{ x: p.x, y: p.y, scale: 0, opacity: 1 }}
                  animate={{
                    x: p.x + Math.cos(angle) * dist,
                    y: p.y + Math.sin(angle) * dist - 20,
                    scale: [0, 1.2, 0.8],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute top-0 left-0 text-sm pointer-events-none select-none"
                  style={{ color: p.color, translateX: '-50%', translateY: '-50%' }}
                >
                  {p.type === 'heart' ? '♥' : '✦'}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </CartAnimationContext.Provider>
  );
};

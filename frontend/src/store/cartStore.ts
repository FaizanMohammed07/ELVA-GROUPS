import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  quantity: number;
  personalization?: Record<string, string>;
  stock: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
  shippingCost: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) => {
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId,
          );
          if (idx >= 0) {
            const updated = [...state.items];
            updated[idx].quantity = Math.min(updated[idx].quantity + item.quantity, item.stock);
            return { items: updated };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId),
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) { get().removeItem(productId, variantId); return; }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      shippingCost: () => get().subtotal() >= 999 ? 0 : 79,
      total: () => {
        const { subtotal, shippingCost, couponDiscount } = get();
        return Math.max(0, subtotal() - couponDiscount + shippingCost());
      },
    }),
    {
      name: 'elva-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

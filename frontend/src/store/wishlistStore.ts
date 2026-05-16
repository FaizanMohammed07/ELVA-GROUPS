import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistState {
  productIds: Set<string>;
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: new Set<string>(),
      toggle: (productId) => {
        const ids = new Set(get().productIds);
        if (ids.has(productId)) ids.delete(productId);
        else ids.add(productId);
        set({ productIds: ids });
      },
      has: (productId) => get().productIds.has(productId),
      clear: () => set({ productIds: new Set() }),
    }),
    {
      name: 'elva-wishlist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ productIds: Array.from(state.productIds) }),
      merge: (persisted: any, current) => ({
        ...current,
        productIds: new Set(persisted.productIds || []),
      }),
    },
  ),
);

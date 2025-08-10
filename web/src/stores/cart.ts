import { create } from 'zustand';
import type { CartItem } from '@/types/cart';

interface CartState {
  items: (CartItem & { quantity: number })[];
  add: (item: CartItem) => void;
  update: (product_variant_id: number, quantity: number) => void;
  remove: (product_variant_id: number) => void;
  reset: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.product_variant_id === item.product_variant_id,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_variant_id === item.product_variant_id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  update: (product_variant_id, quantity) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.product_variant_id === product_variant_id ? { ...i, quantity } : i,
        )
        .filter((i) => i.quantity > 0),
    })),
  remove: (product_variant_id) =>
    set((state) => ({
      items: state.items.filter(
        (i) => i.product_variant_id !== product_variant_id,
      ),
    })),
  reset: () => set({ items: [] }),
}));

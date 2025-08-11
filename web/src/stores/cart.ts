import { create } from 'zustand';
import type { CartItem } from '@/types/cart';

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  update: (product_variant_id: number, qty: number) => void;
  remove: (product_variant_id: number) => void;
  reset: () => void;
  setPricing: (
    priced: { product_variant_id: number; discount_tnd: number }[],
  ) => void;
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
              ? { ...i, qty: i.qty + item.qty }
              : i,
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  update: (product_variant_id, qty) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.product_variant_id === product_variant_id ? { ...i, qty } : i,
        )
        .filter((i) => i.qty > 0),
    })),
  remove: (product_variant_id) =>
    set((state) => ({
      items: state.items.filter(
        (i) => i.product_variant_id !== product_variant_id,
      ),
    })),
  reset: () => set({ items: [] }),
  setPricing: (priced) =>
    set((state) => ({
      items: state.items.map((i) => {
        const p = priced.find((pi) => pi.product_variant_id === i.product_variant_id);
        return p ? { ...i, discount_tnd: p.discount_tnd } : { ...i, discount_tnd: 0 };
      }),
    })),
}));

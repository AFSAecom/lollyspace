import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (item: { id: number; name: string }) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
}));

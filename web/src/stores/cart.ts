import { create } from 'zustand';
import { getDb } from '../services/db';
import type { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
  add: (item: { id: number; name: string }) => void;
  reset: () => void;
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
  reset: () => set({ items: [] }),
}));

// Hydrate cart draft from IndexedDB
(async () => {
  const db = await getDb();
  if (db) {
    const draft = await db.table('cart_draft').get('current');
    if (draft?.items) {
      useCartStore.setState({ items: draft.items as CartItem[] });
    }
    useCartStore.subscribe(async (state) => {
      await db.table('cart_draft').put({
        id: 'current',
        items: state.items,
        updatedAt: Date.now(),
      });
    });
  }
})();

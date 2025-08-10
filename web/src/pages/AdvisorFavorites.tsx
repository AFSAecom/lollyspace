import { useCartStore } from '@/stores/cart';
import type { CartItem } from '@/types/cart';

export default function AdvisorFavorites() {
  const add = useCartStore((s) => s.add);
  const favorites: CartItem[] = [];
  return (
    <div>
      {favorites.length === 0 ? (
        <div>Favoris</div>
      ) : (
        favorites.map((f) => (
          <button
            key={f.product_variant_id}
            onClick={() => add(f)}
            className="block"
          >
            {f.name}
          </button>
        ))
      )}
    </div>
  );
}

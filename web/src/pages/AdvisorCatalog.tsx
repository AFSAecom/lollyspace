import { useState } from 'react';
import SearchBarDual from '@/components/SearchBarDual';
import VolumeButtons from '@/components/VolumeButtons';
import { useSearchProducts, Product } from '@/services/products';
import { useCartStore } from '@/stores/cart';
import type { CartItem } from '@/types/cart';
import type { ProductVariant } from '@/types/product';

export default function AdvisorCatalog() {
  const [search, setSearch] = useState({
    q_brand_name: '',
    q_ingredients: '',
  });
  const { data } = useSearchProducts({ ...search, page: 1, page_size: 20 });
  const add = useCartStore((s) => s.add);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: number) => {
    const next = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : favorites.concat(id);
    setFavorites(next);
    localStorage.setItem('favorites', JSON.stringify(next));
  };

  const handleAdd = (p: Product, v: ProductVariant) => {
    const item: CartItem = {
      product_variant_id: v.id,
      name: p.inspired_name,
      qty: 1,
      unit_price_tnd: v.price_tnd,
      discount_tnd: 0,
    };
    add(item);
  };

  return (
    <div>
      <SearchBarDual onSearch={(params) => setSearch(params)} />
      <div className="mt-4 grid gap-4">
        {data?.map((p) => (
          <div key={p.id} className="border p-2 rounded bg-background text-foreground">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif">{p.inspired_name}</h3>
                <p className="text-sm text-muted">{p.inspired_brand}</p>
              </div>
              <button onClick={() => toggleFavorite(p.id)}>
                {favorites.includes(p.id) ? '★' : '☆'}
              </button>
            </div>
            <div className="mt-2">
              <VolumeButtons
                variants={p.variants || []}
                onSelect={(v) => handleAdd(p, v)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


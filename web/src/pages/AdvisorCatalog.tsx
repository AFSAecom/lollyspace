import { useState } from 'react';
import SearchBarDual from '@/components/SearchBarDual';
import VolumeButtons from '@/components/VolumeButtons';
import { useSearchProducts, Product } from '@/services/products';
import { useCartStore } from '@/stores/cart';

export default function AdvisorCatalog() {
  const [query, setQuery] = useState('');
  const { data } = useSearchProducts(query, 1);
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

  const handleAdd = (p: Product, volume: number) => {
    // In real implementation, variant info would come from API
    const product_variant_id = Number(`${p.id}${volume}`);
    add({
      id: p.id,
      name: p.inspired_name,
      product_variant_id,
      price_tnd: 0,
      discount_tnd: 0,
    });
  };

  return (
    <div>
      <SearchBarDual onSearch={setQuery} />
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
                volumes={[30, 50, 100]}
                onSelect={(v) => handleAdd(p, v)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


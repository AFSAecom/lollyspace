import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import SearchBarDual from '../components/SearchBarDual';
import { useSearchProducts } from '../services/products';
import { useCartStore } from '../stores/cart';
import type { CartItem } from '@/types/cart';
import type { ProductVariant } from '@/types/product';

export default function Client() {
  const [search, setSearch] = useState({
    query_name_brand: '',
    query_notes: '',
  });
  const [page, setPage] = useState(1);
  const { data } = useSearchProducts({ ...search, page });
  const add = useCartStore((s) => s.add);
  const [seedCode, setSeedCode] = useState<string | null>(null);

  const activateSeed = async () => {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const res = await fetch(`${baseUrl}/rest/v1/rpc/rpc_activate_seed`, {
      method: 'POST',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const code = await res.json();
      setSeedCode(code as string);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        {seedCode ? (
          <div>Your seed code: {seedCode}</div>
        ) : (
          <button onClick={activateSeed}>Devenir Seed</button>
        )}
      </div>
      <SearchBarDual
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data?.map((p) => (
          <ProductCard
            key={p.id}
            name={p.inspired_name}
            brand={p.inspired_brand}
            variants={p.variants || []}
            onAdd={(v: ProductVariant) => {
              const item: CartItem = {
                id: p.id,
                name: p.inspired_name,
                product_variant_id: v.id,
                price_tnd: v.priceTnd,
                discount_tnd: 0,
              };
              add(item);
            }}
          />
        ))}
      </div>
      {(search.query_name_brand || search.query_notes) && (
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </button>
          <span>{page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!data || data.length < 20}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import SearchBarDual from '../components/SearchBarDual';
import { useSearchProducts } from '../services/products';
import { useCartStore } from '../stores/cart';
import type { CartItem } from '@/types/cart';
import type { ProductVariant } from '@/types/product';

export default function Client() {
  const [search, setSearch] = useState({
    q_brand_name: '',
    q_ingredients: '',
  });
  const [filters, setFilters] = useState({ gender: '', season: '', family: '' });
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data } = useSearchProducts({
    ...search,
    ...filters,
    page,
    page_size: pageSize,
  });
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
      <div className="flex gap-2">
        <select
          value={filters.gender}
          onChange={(e) => {
            setFilters((f) => ({ ...f, gender: e.target.value }));
            setPage(1);
          }}
        >
          <option value="">Genre</option>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
          <option value="unisex">Unisexe</option>
        </select>
        <select
          value={filters.season}
          onChange={(e) => {
            setFilters((f) => ({ ...f, season: e.target.value }));
            setPage(1);
          }}
        >
          <option value="">Saison</option>
          <option value="spring">Printemps</option>
          <option value="summer">Été</option>
          <option value="fall">Automne</option>
          <option value="winter">Hiver</option>
        </select>
        <select
          value={filters.family}
          onChange={(e) => {
            setFilters((f) => ({ ...f, family: e.target.value }));
            setPage(1);
          }}
        >
          <option value="">Famille</option>
          <option value="floral">Floral</option>
          <option value="citrus">Citrus</option>
          <option value="woody">Boisé</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data?.map((p) => (
          <ProductCard
            key={p.id}
            name={p.inspired_name}
            brand={p.inspired_brand}
            variants={p.variants || []}
            onAdd={(v: ProductVariant) => {
              const item: CartItem = {
                product_variant_id: v.id,
                name: p.inspired_name,
                qty: 1,
                unit_price_tnd: v.price_tnd,
                discount_tnd: 0,
              };
              add(item);
            }}
          />
        ))}
      </div>
      {(search.q_brand_name || search.q_ingredients || filters.gender || filters.season || filters.family) && (
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </button>
          <span>{page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={!data || data.length < pageSize}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

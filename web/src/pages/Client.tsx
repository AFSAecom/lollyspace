import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import SearchBarDual from '../components/SearchBarDual';
import { useSearchProducts, ProductVariant } from '../services/products';
import { useCartStore } from '../stores/cart';
import type { CartItem } from '@/types/cart';

export default function Client() {
  const [search, setSearch] = useState({
    query_name_brand: '',
    query_notes: '',
  });
  const [page, setPage] = useState(1);
  const { data } = useSearchProducts({ ...search, page });
  const add = useCartStore((s) => s.add);

  return (
    <div className="space-y-4">
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
                price_tnd: v.price_tnd,
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

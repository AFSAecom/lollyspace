import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import SearchBarDual from '../components/SearchBarDual';
import { useSearchProducts } from '../services/products';
import { useCartStore } from '../stores/cart';

export default function Client() {
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const { data } = useSearchProducts(term, page);
  const add = useCartStore((s) => s.add);

  return (
    <div className="space-y-4">
      <SearchBarDual
        onSearch={(value) => {
          setTerm(value);
          setPage(1);
        }}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data?.map((p) => (
          <ProductCard
            key={p.id}
            name={p.inspired_name}
            brand={p.inspired_brand}
            onAdd={() => add({ id: p.id, name: p.inspired_name })}
          />
        ))}
      </div>
      {term && (
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

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../services/products';

const PAGE_SIZE = 20;

export function Catalog() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page],
    queryFn: () => searchProducts({ page, limit: PAGE_SIZE }),
    keepPreviousData: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <ul>
        {data?.items?.map((item: any) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <button disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
        Previous
      </button>
      <button
        disabled={data && page * PAGE_SIZE >= data.total}
        onClick={() => setPage((p) => p + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Catalog;

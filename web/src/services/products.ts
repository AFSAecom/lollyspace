import { useQuery } from '@tanstack/react-query';

export interface Product {
  id: number;
  inspired_name: string;
  inspired_brand: string;
}

async function searchProducts(query: string, page: number) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/search_products`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ query, page, per_page: 20 }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as Product[];
}

export function useSearchProducts(query: string, page: number) {
  return useQuery({
    queryKey: ['products', query, page],
    queryFn: () => searchProducts(query, page),
    enabled: query.length > 0,
  });
}

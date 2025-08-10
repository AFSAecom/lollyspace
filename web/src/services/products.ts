import { useQuery } from '@tanstack/react-query';
import { getDb } from './db';

export interface Product {
  id: number;
  inspired_name: string;
  inspired_brand: string;
  active: boolean;
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

export async function fetchProducts() {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?select=*`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    const data = (await res.json()) as Product[];
    const db = await getDb();
    if (db) {
      await db.table('catalog_cache').bulkPut(
        data.map((p) => ({ id: p.id, data: p, updatedAt: Date.now() }))
      );
    }
    return data;
  } catch (err) {
    const db = await getDb();
    if (db) {
      const cached = await db.table('catalog_cache').toArray();
      return cached.map((c: any) => c.data as Product);
    }
    throw err;
  }
}

export function useAllProducts() {
  return useQuery({ queryKey: ['all-products'], queryFn: fetchProducts });
}

export async function updateProductStatus(id: number, active: boolean) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?id=eq.${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ active }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

import { useQuery } from '@tanstack/react-query';

export interface ProductVariant {
  id: number;
  volume_ml: number;
  price_tnd: number;
  product_id: number;
}

export interface Product {
  id: number;
  inspired_name: string;
  inspired_brand: string;
  active: boolean;
  variants?: ProductVariant[];
}

export interface SearchParams {
  query_name_brand: string;
  query_notes: string;
  gender?: string;
  season?: string;
  family?: string;
  page: number;
}

async function searchProducts(params: SearchParams) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/search_products`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ ...params, per_page: 20 }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const products = (await res.json()) as Product[];
  const ids = products.map((p) => p.id);
  if (ids.length === 0) return products;
  const varRes = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_variants?select=id,product_id,volume_ml,price_tnd&product_id=in.(${ids.join(',')})`,
    {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    },
  );
  if (varRes.ok) {
    const vars = (await varRes.json()) as ProductVariant[];
    const byProduct: Record<number, ProductVariant[]> = {};
    for (const v of vars) {
      byProduct[v.product_id] = byProduct[v.product_id] || [];
      byProduct[v.product_id].push(v);
    }
    products.forEach((p) => {
      p.variants = byProduct[p.id] || [];
    });
  }
  return products;
}

export function useSearchProducts(params: SearchParams) {
  return useQuery({
    queryKey: [
      'products',
      params.query_name_brand,
      params.query_notes,
      params.gender,
      params.season,
      params.family,
      params.page,
    ],
    queryFn: () => searchProducts(params),
    enabled:
      params.query_name_brand.length > 0 ||
      params.query_notes.length > 0 ||
      !!params.gender ||
      !!params.season ||
      !!params.family,
  });
}

async function fetchProducts() {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?select=*`;
  const res = await fetch(url, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as Product[];
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

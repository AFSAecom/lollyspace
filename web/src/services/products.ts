import { useQuery } from '@tanstack/react-query';
import type { ProductVariant } from '@/types/product';

export interface Product {
  id: number;
  inspired_name: string;
  inspired_brand: string;
  active: boolean;
  variants?: ProductVariant[];
}

export interface SearchParams {
  q_brand_name: string;
  q_ingredients: string;
  gender?: string;
  season?: string;
  family?: string;
  page: number;
  page_size: number;
}

function fromApiVariant(row: any): ProductVariant {
  return {
    id: row.id,
    product_id: row.product_id,
    size_ml: row.volume_ml,
    price_tnd: row.price_tnd,
    discount_tnd: row.discount_tnd ?? undefined,
    name: row.name ?? undefined,
  };
}

export function toApiVariant(variant: ProductVariant) {
  return {
    id: variant.id,
    product_id: variant.product_id,
    volume_ml: variant.size_ml,
    price_tnd: variant.price_tnd,
    discount_tnd: variant.discount_tnd,
    name: variant.name,
  };
}

async function searchProducts(params: SearchParams) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/rpc_search_products`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const products = (await res.json()) as Product[];
  const ids = products.map((p) => p.id);
  if (ids.length === 0) return products;
  const varRes = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_variants?select=id,product_id,volume_ml,price_tnd,discount_tnd,name&product_id=in.(${ids.join(',')})`,
    {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    },
  );
  if (varRes.ok) {
    const vars = ((await varRes.json()) as any[]).map(fromApiVariant);
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
      params.q_brand_name,
      params.q_ingredients,
      params.gender,
      params.season,
      params.family,
      params.page,
      params.page_size,
    ],
    queryFn: () => searchProducts(params),
    enabled:
      params.q_brand_name.length > 0 ||
      params.q_ingredients.length > 0 ||
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

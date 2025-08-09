import { useQuery } from '@tanstack/react-query';

export interface ProductVariant {
  id: number;
  variant_code: string;
  volume_ml: number;
  stock_qty: number;
  stock_min: number;
  products: { inspired_name: string };
}

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

async function fetchVariants() {
  const res = await fetch(
    `${baseUrl}/rest/v1/product_variants?select=*,products(inspired_name)`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as ProductVariant[];
}

export function useProductVariants() {
  return useQuery({ queryKey: ['product_variants'], queryFn: fetchVariants });
}

export async function importStock(data: FormData) {
  const res = await fetch(`${baseUrl}/functions/v1/stock_import`, {
    method: 'POST',
    headers,
    body: data,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

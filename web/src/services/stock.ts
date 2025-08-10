import { useQuery } from '@tanstack/react-query';
import type { ProductVariant } from '@/types/product';

export interface StockVariant extends ProductVariant {
  variantCode: string;
  stockQty: number;
  stockMin: number;
  products: { inspiredName: string };
}

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

function fromApiStockVariant(row: any): StockVariant {
  return {
    id: row.id,
    productId: row.product_id,
    sizeMl: row.volume_ml,
    priceTnd: row.price_tnd,
    discountTnd: row.discount_tnd ?? undefined,
    name: row.name ?? undefined,
    variantCode: row.variant_code,
    stockQty: row.stock_qty,
    stockMin: row.stock_min,
    products: { inspiredName: row.products?.inspired_name },
  };
}

async function fetchVariants(): Promise<StockVariant[]> {
  const res = await fetch(
    `${baseUrl}/rest/v1/product_variants?select=*,products(inspired_name)`,
    { headers }
  );
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = (await res.json()) as any[];
  return data.map(fromApiStockVariant);
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

import { useQuery } from '@tanstack/react-query';
import type { ProductVariant } from '@/types/product';

export interface StockVariant extends ProductVariant {
  variantCode: string;
  stockCurrent: number;
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
    product_id: row.product_id,
    size_ml: row.volume_ml,
    price_tnd: row.price_tnd,
    discount_tnd: row.discount_tnd ?? undefined,
    name: row.name ?? undefined,
    variantCode: row.variant_code,
    stockCurrent: row.variant_stocks?.stock_current ?? 0,
    stockMin: row.variant_stocks?.stock_min ?? 0,
    products: { inspiredName: row.products?.inspired_name },
  };
}

interface StockQueryResult {
  rows: StockVariant[];
  counts: { ruptures: number; low: number; ok: number };
}

async function fetchVariants(page: number, size: number): Promise<StockQueryResult> {
  const res = await fetch(`${baseUrl}/rest/v1/rpc/rpc_get_stock_state`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, size, filters: {} }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = await res.json();
  const rows = ((data?.rows as any[]) || []).map(fromApiStockVariant);
  return { rows, counts: data?.counts };
}

export function useProductVariants(page: number, size: number) {
  return useQuery({ queryKey: ['product_variants', page, size], queryFn: () => fetchVariants(page, size) });
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

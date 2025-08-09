import { supabase } from './supabase';

export interface ProductSearchParams {
  q?: string;
  notes?: string[];
  gender?: string;
  season?: string;
  family?: string;
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  items: any[];
  total: number;
}

export async function searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
  const { data, error } = await supabase.rpc('search_products', {
    q: params.q ?? null,
    notes: params.notes ?? null,
    gender: params.gender ?? null,
    season: params.season ?? null,
    family: params.family ?? null,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  });
  if (error) throw error;
  return data as ProductSearchResult;
}

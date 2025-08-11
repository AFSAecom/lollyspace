import { useQuery } from '@tanstack/react-query';
import { Promotion, PromotionInput, PromotionId } from '@/types/promotion';

const baseUrl = '/api/admin/promotions';
const headers = { 'Content-Type': 'application/json' };

async function fetchPromotions() {
  const res = await fetch(baseUrl);
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as Promotion[];
}

export function usePromotions() {
  return useQuery({ queryKey: ['promotions'], queryFn: fetchPromotions });
}

export async function setPromotionActive(id: PromotionId, active: boolean) {
  const res = await fetch(`${baseUrl}/${id}/active`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ active }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function deletePromotion(id: PromotionId) {
  const res = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function savePromotion(promo: PromotionInput) {
  const method = promo.id ? 'PUT' : 'POST';
  const url = promo.id ? `${baseUrl}/${promo.id}` : baseUrl;
  const res = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(promo),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export interface PromotionItem {
  product_variant_id: number;
  qty: number;
  unit_price_tnd: number;
  discount_tnd?: number;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseHeaders = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export async function applyPromotions(items: PromotionItem[]) {
  const res = await fetch(`${supabaseUrl}/functions/v1/apply_promotions`, {
    method: 'POST',
    headers: supabaseHeaders,
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as { items: PromotionItem[] };
}

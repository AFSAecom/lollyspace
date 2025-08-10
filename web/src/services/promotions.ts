import { useQuery } from '@tanstack/react-query';
import { PromotionId } from '@/types/promotion';
export type { PromotionId };

export interface DiscountCondition {
  product_variant_id: number;
  percent: number;
}

export interface TwoPlusOneCondition {
  product_variant_id: number;
}

export interface PackCondition {
  product_variant_ids: number[];
  price: number;
}

export type PromotionCondition =
  | DiscountCondition
  | TwoPlusOneCondition
  | PackCondition;

export interface Promotion {
  id: PromotionId;
  type: 'discount' | 'two_plus_one' | 'pack';
  condition_json: PromotionCondition;
  starts_at: string;
  ends_at: string;
  active: boolean;
}

export interface PromotionInput {
  id?: PromotionId;
  type: 'discount' | 'two_plus_one' | 'pack';
  condition_json: PromotionCondition;
  starts_at: string;
  ends_at: string;
  active: boolean;
}

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function fetchPromotions() {
  const res = await fetch(`${baseUrl}/rest/v1/promotions?select=*`, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as Promotion[];
}

export function usePromotions() {
  return useQuery({ queryKey: ['promotions'], queryFn: fetchPromotions });
}

export async function updatePromotion(id: PromotionId, active: boolean) {
  const res = await fetch(`${baseUrl}/rest/v1/promotions?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ active }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function deletePromotion(id: PromotionId) {
  const res = await fetch(`${baseUrl}/rest/v1/promotions?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function savePromotion(promo: PromotionInput) {
  const method = promo.id ? 'PATCH' : 'POST';
  const url = promo.id
    ? `${baseUrl}/rest/v1/promotions?id=eq.${promo.id}`
    : `${baseUrl}/rest/v1/promotions`;
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

export async function applyPromotions(items: PromotionItem[]) {
  const res = await fetch(`${baseUrl}/functions/v1/apply_promotions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as { items: PromotionItem[] };
}


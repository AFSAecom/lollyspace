import { useQuery } from '@tanstack/react-query';

export interface Promotion {
  id: number;
  type: string;
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

export async function updatePromotion(id: number, active: boolean) {
  const res = await fetch(`${baseUrl}/rest/v1/promotions?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ active }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}


import { useQuery } from '@tanstack/react-query';

export interface Order {
  id: number;
  order_code: string;
  total_tnd: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_variant_id: number;
  qty: number;
  unit_price_tnd: number;
  discount_tnd: number;
  total_line_tnd: number;
}

export interface AdminSetting {
  key: string;
  value: unknown;
  updated_at: string;
}

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

async function fetchWithRls(path: string) {
  const res = await fetch(`${baseUrl}/rest/v1/${path}`, { headers });
  if (res.status === 401 || res.status === 403) {
    throw new Error('RLS: access denied');
  }
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchWithRls('orders?select=*'),
  });
}

export function useOrderItems(orderId: number) {
  return useQuery({
    queryKey: ['order_items', orderId],
    queryFn: () => fetchWithRls(`order_items?order_id=eq.${orderId}&select=*`),
    enabled: !!orderId,
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin_settings'],
    queryFn: () => fetchWithRls('admin_settings?select=*'),
  });
}


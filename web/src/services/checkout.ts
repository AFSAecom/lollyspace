import { applyPromotions, PromotionItem } from './promotions';

const env =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : process.env;
const baseUrl = env.VITE_SUPABASE_URL as string;
const headers = {
  apikey: env.VITE_SUPABASE_ANON_KEY as string,
  Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export async function checkoutAdvisor(payload: {
  advisor_id: string;
  client:
    | { id: string }
    | { first_name: string; last_name: string; phone: string };
  items: PromotionItem[];
}) {
  const promo = await applyPromotions(payload.items);
  const res = await fetch(`${baseUrl}/functions/v1/checkout_advisor`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, items: promo.items }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

const OFFLINE_KEY = 'offline-sales';

function saveOffline(payload: any) {
  if (typeof localStorage === 'undefined') return;
  const queue = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
  queue.push(payload);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
}

export async function syncOfflineSales() {
  if (typeof localStorage === 'undefined') return;
  const queue = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
  if (queue.length === 0) return;
  const remaining: any[] = [];
  for (const sale of queue) {
    try {
      await checkoutAdvisor(sale);
    } catch (e) {
      remaining.push(sale);
    }
  }
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineSales();
  });
}

export async function checkoutAdvisorWithOffline(payload: {
  advisor_id: string;
  client:
    | { id: string }
    | { first_name: string; last_name: string; phone: string };
  items: PromotionItem[];
}) {
  try {
    return await checkoutAdvisor(payload);
  } catch (e) {
    saveOffline(payload);
    throw e;
  }
}


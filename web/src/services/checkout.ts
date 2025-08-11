import { applyPromotions, type PromotionItem } from './promotions';

const promoEnabled = import.meta.env.VITE_PROMO_V2_ENABLED === 'true';

const baseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export async function checkoutAdvisor(payload: {
  advisor_id: string;
  client:
    | { id: string }
    | { first_name: string; last_name: string; phone: string };
  items: PromotionItem[];
}) {
  const pricedItems = promoEnabled
    ? (await applyPromotions(payload.items)).items
    : payload.items;
  const res = await fetch(`${baseUrl}/functions/v1/checkout_advisor`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, items: pricedItems }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

const OFFLINE_KEY = 'offline-sales';

type CheckoutPayload = Parameters<typeof checkoutAdvisor>[0];

function saveOffline(payload: CheckoutPayload) {
  if (typeof localStorage === 'undefined') return;
  const queue: CheckoutPayload[] = JSON.parse(
    localStorage.getItem(OFFLINE_KEY) || '[]',
  );
  queue.push(payload);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
}

export async function syncOfflineSales() {
  if (typeof localStorage === 'undefined') return;
  const queue: CheckoutPayload[] = JSON.parse(
    localStorage.getItem(OFFLINE_KEY) || '[]',
  );
  if (queue.length === 0) return;
  const remaining: CheckoutPayload[] = [];
  for (const sale of queue) {
    try {
      await checkoutAdvisor(sale);
    } catch {
      remaining.push(sale);
    }
  }
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void syncOfflineSales();
  });
}

export async function checkoutAdvisorWithOffline(
  payload: CheckoutPayload,
) {
  try {
    return await checkoutAdvisor(payload);
  } catch (e) {
    saveOffline(payload);
    throw e;
  }
}


import { applyPromotions, PromotionItem } from './promotions';
import { getDb } from './db';
import { addRecentClient, Client } from './clients';

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
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
  const promo = await applyPromotions(payload.items);
  try {
    const res = await fetch(`${baseUrl}/functions/v1/checkout_advisor`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...payload, items: promo.items }),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    if ('id' in payload.client) {
      await addRecentClient(payload.client as Client);
    }
    return res.json();
  } catch (err) {
    const db = await getDb();
    if (db) {
      await db.table('pending_mutations').add({
        type: 'checkoutAdvisor',
        payload,
        createdAt: Date.now(),
      });
      if ('id' in payload.client) {
        await addRecentClient(payload.client as Client);
      }
    }
    throw err;
  }
}

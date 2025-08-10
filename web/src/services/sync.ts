import { getDb } from './db';
import { checkoutAdvisor } from './checkout';
import { fetchProducts } from './products';

export async function syncWithServer() {
  const db = await getDb();
  if (!db) return;

  const mutations = await db.table('pending_mutations').orderBy('createdAt').toArray();
  for (const m of mutations) {
    try {
      if (m.type === 'checkoutAdvisor') {
        await checkoutAdvisor(m.payload);
      }
      await db.table('pending_mutations').delete(m.id);
    } catch {
      break;
    }
  }

  // Last-write-wins: refresh catalog from server
  try {
    await fetchProducts();
  } catch {
    /* ignore */
  }
}

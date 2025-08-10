import { getDb } from './db';

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export async function addRecentClient(client: Client) {
  const db = await getDb();
  if (!db) return;
  await db.table('recent_clients').put({ id: client.id, data: client, updatedAt: Date.now() });
}

export async function getRecentClients(): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];
  const items = await db.table('recent_clients').toArray();
  return items.map((i: any) => i.data as Client);
}

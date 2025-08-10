export interface CatalogCacheItem {
  id: number;
  data: any;
  updatedAt: number;
}

export interface RecentClientItem {
  id: string;
  data: any;
  updatedAt?: number;
}

export interface CartDraftItem {
  id: string;
  items: any[];
  updatedAt: number;
}

export interface PendingMutationItem {
  id?: number;
  type: string;
  payload: any;
  createdAt: number;
}

let dbPromise: Promise<any> | null = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const modName = 'dexie';
      try {
        const { default: Dexie } = await import(/* @vite-ignore */ modName);
        const db = new Dexie('lollyspace');
        db.version(1).stores({
          catalog_cache: '&id,updatedAt',
          recent_clients: '&id',
          cart_draft: '&id',
          pending_mutations: '++id,createdAt',
        });
        return db;
      } catch {
        return null;
      }
    })();
  }
  return dbPromise;
}

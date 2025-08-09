import Dexie, { Table } from 'dexie';

export interface CatalogItem {
  id: string;
  data: unknown;
}

export interface Client {
  id: string;
  name: string;
}

export interface CartDraft {
  id: string;
  items: unknown[];
}

export interface PendingMutation {
  id?: number; // Auto-incremented primary key
  timestamp: number;
  operation: string;
  payload: unknown;
}

class LollyspaceDB extends Dexie {
  catalog!: Table<CatalogItem, string>;
  recentClients!: Table<Client, string>;
  cartDrafts!: Table<CartDraft, string>;
  pendingMutations!: Table<PendingMutation, number>;

  constructor() {
    super('lollyspace');
    this.version(1).stores({
      catalog: 'id',
      recentClients: 'id',
      cartDrafts: 'id',
      pendingMutations: '++id,timestamp'
    });
  }
}

export const db = new LollyspaceDB();

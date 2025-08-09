import { db, PendingMutation } from './db';

/**
 * Queue a mutation for later synchronization.
 */
export async function queueMutation(mutation: Omit<PendingMutation, 'id'>) {
  await db.pendingMutations.add(mutation);
}

/**
 * Replay pending mutations in FIFO order.
 * Placeholder implementation that simply logs each mutation before
 * removing it from the queue.
 */
export async function syncPendingMutations() {
  const mutations = await db.pendingMutations.orderBy('id').toArray();
  for (const mutation of mutations) {
    await sendToServer(mutation);
    if (mutation.id !== undefined) {
      await db.pendingMutations.delete(mutation.id);
    }
  }
}

async function sendToServer(mutation: PendingMutation) {
  // TODO: Replace with real server communication logic
  console.debug('Syncing mutation', mutation);
}

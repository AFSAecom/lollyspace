export async function clearLocalDb() {
  try {
    // @ts-ignore - optional dependency
    const modName = 'dexie';
    const { default: Dexie } = await import(/* @vite-ignore */ modName);
    const db = new Dexie('lollyspace');
    await db.delete();
  } catch (_) {
    if (typeof indexedDB !== 'undefined') {
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('lollyspace');
        req.onsuccess = req.onerror = req.onblocked = () => resolve(undefined);
      });
    }
  }
}

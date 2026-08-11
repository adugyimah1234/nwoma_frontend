import { RegistrationCreateInput } from '@/services/registrations';
import { openDB } from 'idb';

const DB_NAME = 'school-db';
const STORE_NAME = 'registrations';

export async function initRegistrationDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'local_id',
          autoIncrement: true,
        });
        store.createIndex('syncedIndex', 'synced', { unique: false });
      }
    },
  });
}

// Save new offline record
export async function saveOfflineRegistration(data: RegistrationCreateInput) {
  const db = await initRegistrationDB();
  await db.put(STORE_NAME, {
    ...data,
    synced: false,
    created_at: new Date().toISOString(),
  });
}

// Get all unsynced entries
export async function getUnsyncedRegistrations(): Promise<
  (RegistrationCreateInput & { local_id: number })[]
> {
  const db = await initRegistrationDB();
  const tx = db.transaction(STORE_NAME);
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('syncedIndex');
  const results = await index.getAll(0 as any);
  return results as any; // cast to expected type
}

// Mark a record as synced
export async function markRegistrationSynced(local_id: number) {
  const db = await initRegistrationDB();
  const record = await db.get(STORE_NAME, local_id);
  if (record) {
    record.synced = true;
    await db.put(STORE_NAME, record);
  }
}

// Remove a record (if needed)
export async function removeOfflineRegistration(local_id: number) {
  const db = await initRegistrationDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.delete(local_id);
  await tx.done;
}

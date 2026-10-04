import type { EncryptedVaultRecord, VaultKeyEnvelope } from "@monokey/contracts";

import { environment } from "../../app/environment";
const databaseName = `${environment.cacheNamespace}:encrypted`;
const storeName = "encrypted-data";

async function openDatabase(): Promise<IDBDatabase> {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put<T>(key: string, value: T): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function get<T>(key: string): Promise<T | null> {
  const database = await openDatabase();
  const value = await new Promise<T | undefined>((resolve, reject) => {
    const request = database.transaction(storeName, "readonly").objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return value ?? null;
}

export const encryptedCache = {
  async clear(userId: string): Promise<void> {
    const database = await openDatabase();
    try { await new Promise<void>((resolve, reject) => { const transaction = database.transaction(storeName, "readwrite"); const store = transaction.objectStore(storeName); store.delete(`envelope:${userId}`); store.delete(`records:${userId}`); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); }); }
    finally { database.close(); }
  },
  putEnvelope(userId: string, value: VaultKeyEnvelope) { return put(`envelope:${userId}`, value); },
  getEnvelope(userId: string) { return get<VaultKeyEnvelope>(`envelope:${userId}`); },
  putRecords(userId: string, value: EncryptedVaultRecord[]) { return put(`records:${userId}`, value); },
  getRecords(userId: string) { return get<EncryptedVaultRecord[]>(`records:${userId}`); },
};

import * as SQLite from "expo-sqlite";
import type { EncryptedVaultRecord, Subscription, VaultKeyEnvelope } from "@monokey/contracts";
import { environment } from "./environment";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function database(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= (async () => {
    const db = await SQLite.openDatabaseAsync(`monokey-${environment.environment}-${environment.firebase.projectId}-v2.db`);
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS encrypted_vault_cache (user_id TEXT NOT NULL, record_id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY (user_id, record_id));
      CREATE TABLE IF NOT EXISTS vault_envelope_cache (user_id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS subscription_cache (user_id TEXT NOT NULL, subscription_id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY (user_id, subscription_id));
    `);
    return db;
  })();
  return databasePromise;
}

export async function cacheEnvelope(userId: string, value: VaultKeyEnvelope): Promise<void> {
  const db = await database();
  await db.runAsync("INSERT OR REPLACE INTO vault_envelope_cache (user_id, payload) VALUES (?, ?)", userId, JSON.stringify(value));
}

export async function readEnvelope(userId: string): Promise<VaultKeyEnvelope | null> {
  const db = await database();
  const row = await db.getFirstAsync<{ payload: string }>("SELECT payload FROM vault_envelope_cache WHERE user_id = ?", userId);
  return row ? JSON.parse(row.payload) as VaultKeyEnvelope : null;
}

export async function cacheVaultRecords(userId: string, values: EncryptedVaultRecord[]): Promise<void> {
  const db = await database();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM encrypted_vault_cache WHERE user_id = ?", userId);
    for (const value of values) await db.runAsync("INSERT INTO encrypted_vault_cache (user_id, record_id, payload) VALUES (?, ?, ?)", userId, value.id, JSON.stringify(value));
  });
}

export async function readVaultRecords(userId: string): Promise<EncryptedVaultRecord[]> {
  const db = await database();
  const rows = await db.getAllAsync<{ payload: string }>("SELECT payload FROM encrypted_vault_cache WHERE user_id = ?", userId);
  return rows.map(row => JSON.parse(row.payload) as EncryptedVaultRecord);
}

export async function cacheSubscriptions(userId: string, values: Subscription[]): Promise<void> {
  const db = await database();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM subscription_cache WHERE user_id = ?", userId);
    for (const value of values) await db.runAsync("INSERT INTO subscription_cache (user_id, subscription_id, payload) VALUES (?, ?, ?)", userId, value.id, JSON.stringify(value));
  });
}

export async function readSubscriptions(userId: string): Promise<Subscription[]> {
  const db = await database();
  const rows = await db.getAllAsync<{ payload: string }>("SELECT payload FROM subscription_cache WHERE user_id = ?", userId);
  return rows.map(row => JSON.parse(row.payload) as Subscription);
}

export async function clearAccountCache(userId: string): Promise<void> {
 const db = await database(); await db.withTransactionAsync(async () => { for (const table of ["encrypted_vault_cache", "vault_envelope_cache", "subscription_cache"]) await db.runAsync(`DELETE FROM ${table} WHERE user_id = ?`, userId); });
}

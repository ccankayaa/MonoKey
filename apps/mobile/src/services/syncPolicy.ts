import type { EncryptedVaultRecord } from "@monokey/contracts";

export function mergeEncryptedRecords(
  cached: EncryptedVaultRecord[],
  remote: EncryptedVaultRecord[],
): EncryptedVaultRecord[] {
  const merged = new Map(cached.map(record => [record.id, record]));
  for (const candidate of remote) {
    const current = merged.get(candidate.id);
    if (!current || (candidate.revision ?? 0) >= (current.revision ?? 0)) merged.set(candidate.id, candidate);
  }
  return [...merged.values()];
}

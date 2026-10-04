import { Fragment, createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { clearBytes } from "@monokey/crypto";
import type { EncryptedVaultRecord, VaultPlaintextRecord } from "@monokey/contracts";
export interface UnlockedRecord { encrypted: EncryptedVaultRecord; plaintext: VaultPlaintextRecord }
interface Session {
  vaultKey: Uint8Array | null; records: UnlockedRecord[];
  setVaultKey: (key: Uint8Array | null) => void; setRecords: (records: UnlockedRecord[]) => void;
  lock: () => void; isCurrent: (key: Uint8Array) => boolean;
}
const VaultSession = createContext<Session | null>(null);
export function VaultSessionProvider({ children }: PropsWithChildren) {
  const [epoch, setEpoch] = useState(0);
  const [vaultKey, setKey] = useState<Uint8Array | null>(null);
  const [records, setRecords] = useState<UnlockedRecord[]>([]);
  const keyRef = useRef<Uint8Array | null>(null);
  const setVaultKey = (key: Uint8Array | null): void => {
    if (keyRef.current !== key) clearBytes(keyRef.current);
    keyRef.current = key; setKey(key);
  };
  const lock = (): void => { clearBytes(keyRef.current); keyRef.current = null; setKey(null); setRecords([]); setEpoch(value => value + 1); };
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const clear = (): void => { clearBytes(keyRef.current); keyRef.current = null; setKey(null); setRecords([]); setEpoch(value => value + 1); };
    const reset = (): void => { clearTimeout(timer); timer = setTimeout(clear, 300_000); };
    const hidden = (): void => { if (document.visibilityState === "hidden") clear(); };
    reset(); addEventListener("pointerdown", reset, { passive: true }); addEventListener("keydown", reset);
    document.addEventListener("visibilitychange", hidden);
    return () => { clearTimeout(timer); removeEventListener("pointerdown", reset); removeEventListener("keydown", reset); document.removeEventListener("visibilitychange", hidden); clearBytes(keyRef.current); keyRef.current = null; };
  }, []);
  return <VaultSession.Provider value={{ vaultKey, records, setVaultKey, setRecords, lock, isCurrent: key => keyRef.current === key }}><Fragment key={epoch}>{children}</Fragment></VaultSession.Provider>;
}
export function useVaultSession(): Session {
  const session = useContext(VaultSession);
  if (!session) throw new Error("Vault session provider is missing.");
  return session;
}

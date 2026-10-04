import { Fragment, createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { AppState } from "react-native";
import { clearBytes } from "@monokey/crypto";
import type { EncryptedVaultRecord, VaultPlaintextRecord } from "@monokey/contracts";
export interface VisibleRecord { encrypted: EncryptedVaultRecord; plaintext: VaultPlaintextRecord }
interface Session { key: Uint8Array | null; records: VisibleRecord[]; setKey: (key: Uint8Array) => void; setRecords: (records: VisibleRecord[]) => void; lock: () => void; isCurrent: (key: Uint8Array) => boolean }
const Context = createContext<Session | null>(null);
export function VaultSessionProvider({ children }: PropsWithChildren) {
 const [key, setValue] = useState<Uint8Array | null>(null); const [records, setRecords] = useState<VisibleRecord[]>([]); const [epoch, setEpoch] = useState(0); const reference = useRef<Uint8Array | null>(null);
 const lock = (): void => { clearBytes(reference.current); reference.current = null; setValue(null); setRecords([]); setEpoch(value => value + 1); };
 useEffect(() => { const sub = AppState.addEventListener("change", state => { if (state !== "active") lock(); }); return () => { sub.remove(); clearBytes(reference.current); reference.current = null; }; }, []);
 useEffect(() => { if (!key) return; const timer = setTimeout(lock, 300_000); return () => clearTimeout(timer); }, [key]);
 const setKey = (value: Uint8Array): void => { clearBytes(reference.current); reference.current = value; setValue(value); };
 return <Context.Provider value={{key, records, setKey, setRecords, lock, isCurrent: value => reference.current === value}}><Fragment key={epoch}>{children}</Fragment></Context.Provider>;
}
export function useVaultSession(): Session { const value = useContext(Context); if (!value) throw new Error("Vault session missing"); return value; }

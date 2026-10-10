import { BrandPicker } from "../../components/BrandPicker";
import { PasswordGenerator } from "../../components/PasswordGenerator";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, type EncryptedVaultRecord, type VaultKeyEnvelope, type VaultPlaintextRecord } from "@monokey/contracts";
import {

  clearBytes,
  rewrapMasterPassphrase,
  createVault,
  decryptVaultRecord,
  encryptVaultRecord,
  unlockWithMasterPassphrase,
  unlockWithRecoveryCode,
} from "@monokey/crypto";
import { apiClient, monoKeyApi } from "../../app/api";
import { store } from "../../app/store";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "../../i18n/useTranslation";
import { encryptedCache } from "./encryptedCache";

import { useVaultSession, type UnlockedRecord } from "./VaultSession";
interface RecordForm { title: string; username: string; password: string; url: string; notes: string; favorite: boolean }
const emptyForm: RecordForm = { title: "", username: "", password: "", url: "", notes: "", favorite: false };

export function VaultPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [envelope, setEnvelope] = useState<VaultKeyEnvelope | null>(null);
  const [loading, setLoading] = useState(true);
  const session = useVaultSession();
  const { vaultKey, setVaultKey, records, setRecords } = session;
  const [passphrase, setPassphrase] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [pendingSetup, setPendingSetup] = useState<ReturnType<typeof createVault> | null>(null);
  const setupRef = useRef<ReturnType<typeof createVault> | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearBytes(setupRef.current?.vaultKey); setupRef.current = null; }; }, []);
  const [recoveryConfirmed, setRecoveryConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<RecordForm>(emptyForm);
  const [editing, setEditing] = useState<UnlockedRecord | null>(null);
  const [revealId, setRevealId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void (async () => {
      try {
        const value = await apiClient.getVaultKeyEnvelope();
        if (active) { setEnvelope(value); await encryptedCache.putEnvelope(user.uid, value); }
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 404) { if (active) setEnvelope(null); }
        else if (!(caught instanceof ApiError)) {
          const cached = await encryptedCache.getEnvelope(user.uid);
          if (active && cached) setEnvelope(cached); else if (active) setError(t("errorGeneric"));
        }
        else if (active) setError(t("errorGeneric"));
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [t, user]);

  const lock = (): void => { session.lock(); setRevealId(null); setPassphrase(""); setRecoveryInput(""); setForm(emptyForm); setEditing(null); };
  useEffect(() => { const hidden = (): void => { if (document.visibilityState === "hidden") { setForm(emptyForm); setEditing(null); setRevealId(null); setPassphrase(""); setRecoveryInput(""); } }; document.addEventListener("visibilitychange", hidden); return () => document.removeEventListener("visibilitychange", hidden); }, []);

  async function loadRecords(key: Uint8Array): Promise<void> {
    if (!user) return;
    let encrypted: EncryptedVaultRecord[];
    try {
      const page = await apiClient.listVaultRecords();
      encrypted = page.items;
      if (!session.isCurrent(key)) return;
      await encryptedCache.putRecords(user.uid, encrypted);
    } catch (caught) {
      if (caught instanceof ApiError) throw caught;
      encrypted = await encryptedCache.getRecords(user.uid) ?? [];
    }
    const decrypted = encrypted.filter(item => !item.isDeleted).map(item => ({ encrypted: item, plaintext: decryptVaultRecord(key, user.uid, item) }));
    if (session.isCurrent(key)) setRecords(decrypted);
  }

  async function unlock(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!user || !envelope) return;
    setError(null);
    try {
      const key = useRecovery
        ? unlockWithRecoveryCode(recoveryInput.trim(), user.uid, envelope)
        : unlockWithMasterPassphrase(passphrase, user.uid, envelope);
      setVaultKey(key); setPassphrase(""); setRecoveryInput(""); await loadRecords(key);
    } catch (caught) { setError(caught instanceof ApiError && caught.status === 409 ? t("conflict") : t("errorGeneric")); }
  }

  function prepareSetup(event: FormEvent): void {
    event.preventDefault();
    if (!user) return;
    try { clearBytes(setupRef.current?.vaultKey); const setup = createVault(passphrase, user.uid); setupRef.current = setup; setPendingSetup(setup); setPassphrase(""); setError(null); }
    catch { setError(t("errorGeneric")); }
  }

  async function completeSetup(): Promise<void> {
    if (!user || !pendingSetup || !recoveryConfirmed) return;
    try {
      const saved = await apiClient.putVaultKeyEnvelope(pendingSetup.envelope);
      await encryptedCache.putEnvelope(user.uid, saved);
      if (!mounted.current || setupRef.current !== pendingSetup) return;
      setEnvelope(saved); setVaultKey(pendingSetup.vaultKey); setupRef.current = null; setPendingSetup(null); setRecoveryConfirmed(false);
    } catch (caught) { setError(caught instanceof ApiError && caught.status === 409 ? t("conflict") : t("errorGeneric")); }
  }

  async function saveRecord(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!user || !vaultKey || !form.title.trim()) return;
    const id = editing?.encrypted.id ?? crypto.randomUUID();
    const plaintext: VaultPlaintextRecord = {
      schemaVersion: 1,
      kind: "login",
      ...(editing?.plaintext.nativeAutofill ? {nativeAutofill: editing.plaintext.nativeAutofill} : {}),
      title: form.title.trim(), username: form.username, password: form.password, url: form.url, notes: form.notes,
      favorite: form.favorite, updatedAtUtc: new Date().toISOString(),
    };
    const encrypted = encryptVaultRecord(vaultKey, user.uid, id, plaintext);
    try {
      let saved: EncryptedVaultRecord;
      if (editing) {
        if (editing.encrypted.revision === undefined) throw new Error("The record revision is missing.");
        saved = await apiClient.updateVaultRecord({ ...encrypted, expectedRevision: editing.encrypted.revision });
      } else {
        saved = await apiClient.createVaultRecord(encrypted);
      }
      const next = [...records.filter(item => item.encrypted.id !== id), { encrypted: saved, plaintext }];
      if (!session.isCurrent(vaultKey)) return;
      setRecords(next); await encryptedCache.putRecords(user.uid, next.map(item => item.encrypted));
      setForm(emptyForm); setEditing(null);
    } catch (caught) { setError(caught instanceof ApiError && caught.status === 409 ? t("conflict") : t("errorGeneric")); }
  }

  async function removeRecord(item: UnlockedRecord): Promise<void> {
    if (!user || item.encrypted.revision === undefined) return;
    try {
      const tombstone = await apiClient.deleteVaultRecord(item.encrypted.id, item.encrypted.revision);
      store.dispatch(monoKeyApi.util.invalidateTags(["VaultLinks"]));
      const next = records.filter(candidate => candidate.encrypted.id !== item.encrypted.id);
      if (!vaultKey || !session.isCurrent(vaultKey)) return;
      setRecords(next);
      const cached = await encryptedCache.getRecords(user.uid) ?? [];
      await encryptedCache.putRecords(user.uid, [...cached.filter(value => value.id !== item.encrypted.id), tombstone]);
    } catch (caught) { setError(caught instanceof ApiError && caught.status === 409 ? t("conflict") : t("errorGeneric")); }
  }

  function beginEdit(item: UnlockedRecord): void {
    setEditing(item);
    setForm({ title: item.plaintext.title, username: item.plaintext.username ?? "", password: item.plaintext.password ?? "", url: item.plaintext.url ?? "", notes: item.plaintext.notes ?? "", favorite: item.plaintext.favorite });
  }

  async function copySecret(value: string): Promise<void> {
    try { await navigator.clipboard.writeText(value); } catch { setError(t("copyFailed")); return; }
    window.setTimeout(() => void navigator.clipboard.writeText("").catch(() => undefined), 30_000);
  }

  if (loading) return <p role="status">{t("loading")}</p>;
  if (pendingSetup) return <section className="card vault-locked"><h1>{t("recoveryCode")}</h1><p className="banner error">{t("recoveryWarning")}</p><p className="secret">{pendingSetup.recoveryCode}</p><label><input type="checkbox" checked={recoveryConfirmed} onChange={event => setRecoveryConfirmed(event.target.checked)} /> {t("confirmRecovery")}</label><p><button className="button" disabled={!recoveryConfirmed} onClick={() => void completeSetup()}>{t("save")}</button></p></section>;
  if (!envelope) return <section className="card vault-locked"><h1>{t("setupVault")}</h1><p>{t("recoveryWarning")}</p><form className="form" onSubmit={prepareSetup}><div className="field"><label htmlFor="setup-passphrase">{t("masterPassphrase")}</label><input id="setup-passphrase" type="password" minLength={12} autoComplete="new-password" value={passphrase} onChange={event => setPassphrase(event.target.value)} required /></div>{error && <p className="error" role="alert">{error}</p>}<button className="button">{t("setupVault")}</button></form></section>;
  if (!vaultKey) return <section className="card vault-locked"><h1>{t("locked")}</h1><p>{t("vaultPrivacy")}</p><form className="form" onSubmit={event => void unlock(event)}>{useRecovery ? <div className="field"><label htmlFor="recovery">{t("recoveryCode")}</label><input id="recovery" className="secret" value={recoveryInput} onChange={event => setRecoveryInput(event.target.value)} required /></div> : <div className="field"><label htmlFor="unlock-passphrase">{t("masterPassphrase")}</label><input id="unlock-passphrase" type="password" autoComplete="current-password" value={passphrase} onChange={event => setPassphrase(event.target.value)} required /></div>}{error && <p className="error" role="alert">{error}</p>}<button className="button">{t("unlockVault")}</button><button className="button secondary" type="button" onClick={() => setUseRecovery(value => !value)}>{t("recoveryCode")}</button></form></section>;

  async function changePassphrase(event: FormEvent): Promise<void> {
    event.preventDefault(); if (!user || !vaultKey || !envelope) return;
    try { const saved = await apiClient.putVaultKeyEnvelope(rewrapMasterPassphrase(vaultKey, passphrase, user.uid, envelope)); setEnvelope(saved); await encryptedCache.putEnvelope(user.uid, saved); setPassphrase(""); }
    catch (caught) { setError(caught instanceof ApiError && caught.status === 409 ? t("conflict") : t("errorGeneric")); }
  }
  const visible = records.filter(item => `${item.plaintext.title} ${item.plaintext.username ?? ""} ${item.plaintext.url ?? ""}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  return <>
    <header className="page-header"><div><h1>{t("vault")}</h1><p className="success">{t("unlocked")}</p></div><button className="button secondary" onClick={() => {
      const blob = new Blob([JSON.stringify({ format: "monokey-plaintext-export-v1", records: records.map(item => item.plaintext) }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "monokey-vault-export.json"; anchor.click(); URL.revokeObjectURL(url);
    }}>{t("exportVault")}</button><button className="button secondary" onClick={lock}>{t("lockVault")}</button></header>
    <div className="field"><label htmlFor="vault-search" className="sr-only">{t("search")}</label><input id="vault-search" type="search" placeholder={t("search")} value={search} onChange={event => setSearch(event.target.value)} /></div>
    <form className="card form" onSubmit={event => void saveRecord(event)} style={{ margin: "20px 0" }}>
      <h2>{editing ? t("save") : t("createRecord")}</h2><BrandPicker onSelect={brand=>setForm({...form,title:brand.name.tr,url:`https://${brand.domains[0]}/`})} />
      <div className="field"><label htmlFor="record-title">{t("title")}</label><input id="record-title" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} required /></div>
      <div className="field"><label htmlFor="record-username">{t("username")}</label><input id="record-username" autoComplete="off" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} /></div>
      <div className="field"><label htmlFor="record-password">{t("password")}</label><div className="actions"><input id="record-password" style={{ flex: 1 }} type="password" autoComplete="new-password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /><PasswordGenerator onUse={value => setForm({ ...form, password: value })} /></div></div>
      <div className="field"><label htmlFor="record-url">{t("url")}</label><input id="record-url" type="url" value={form.url} onChange={event => setForm({ ...form, url: event.target.value })} /></div>
      <div className="field"><label htmlFor="record-notes">{t("notes")}</label><textarea id="record-notes" value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></div>
      <label><input type="checkbox" checked={form.favorite} onChange={event => setForm({ ...form, favorite: event.target.checked })} /> {t("favorite")}</label>
      {error && <p className="error" role="alert">{error}</p>}<div className="actions"><button className="button">{t("save")}</button>{editing && <button type="button" className="button secondary" onClick={() => { setEditing(null); setForm(emptyForm); }}>{t("cancel")}</button>}</div>
    </form>
    {visible.length === 0 && <p className="card">{t("noVaultRecords")}</p>}
    <form className="card form" onSubmit={event => void changePassphrase(event)}><label htmlFor="new-passphrase">{t("changeMasterPassphrase")}</label><input id="new-passphrase" type="password" minLength={12} autoComplete="new-password" value={passphrase} onChange={event => setPassphrase(event.target.value)} required /><button className="button">{t("save")}</button></form>
    <ul className="list">{visible.map(item => <li className="list-item" key={item.encrypted.id}><div><h2>{item.plaintext.favorite ? "★ " : ""}{item.plaintext.title}</h2><p>{item.plaintext.username}</p>{item.plaintext.password && <p className="secret">{revealId === item.encrypted.id ? item.plaintext.password : "••••••••••••"}</p>}</div><div className="actions">{item.plaintext.password && <><button className="button secondary" onClick={() => setRevealId(revealId === item.encrypted.id ? null : item.encrypted.id)}>{revealId === item.encrypted.id ? t("hide") : t("reveal")}</button><button className="button secondary" onClick={() => void copySecret(item.plaintext.password ?? "")}>{t("copy")}</button></>}<button className="button secondary" onClick={() => beginEdit(item)}>{t("edit")}</button><button className="button danger" onClick={() => confirm(t("delete")) && void removeRecord(item)}>{t("delete")}</button></div></li>)}</ul>
  </>;
}

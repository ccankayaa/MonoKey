import { BrandPicker } from "../../components/BrandPicker";
import { PasswordGenerator } from "../../components/PasswordGenerator";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, type BillingIntervalUnit, type Subscription, type SubscriptionInput, type EncryptedVaultRecord } from "@monokey/contracts";
import { encryptVaultRecord } from "@monokey/crypto";
import { apiClient, monoKeyApi } from "../../app/api";
import { store } from "../../app/store";
import { useAuth } from "../auth/AuthContext";
import { useVaultSession } from "../vault/VaultSession";
import { useTranslation } from "../../i18n/useTranslation";
import { Dialog } from "../../components/Dialog";
import { isValidSubscriptionInput } from "./SubscriptionsPage";

export function SubscriptionDialog({ subscription, onClose }: { subscription: Subscription | null; onClose: () => void }) {
  const { t } = useTranslation(); const { user } = useAuth(); const session = useVaultSession();
  const [input, setInput] = useState<SubscriptionInput>(subscription ?? { name: "", amount: 0, currencyCode: "TRY", billingIntervalUnit: "Month", billingIntervalCount: 1, nextRenewalDate: "", providerPlanLabel: "", category: "", paymentMethodLabel: "" });
  const [selected, setSelected] = useState<string[]>([]); const original = useRef<string[]>([]);
  const [credential, setCredential] = useState({ enabled: false, username: "", password: "", url: "" });
  const requestId = useRef(crypto.randomUUID()); const pendingRecord = useRef<EncryptedVaultRecord | null>(null);
  const savedSubscription = useRef<Subscription | null>(null); const [busy, setBusy] = useState(false); const [saved, setSaved] = useState(false); const [error, setError] = useState("");
  const [linksReady,setLinksReady]=useState(!subscription); const [linkAttempt,setLinkAttempt]=useState(0);
  useEffect(() => {
    if (!subscription) return;
    let active = true;
    void apiClient.listVaultLinks(subscription.id).then(links => { if (active) { const ids = links.map(item => item.vaultRecordId); original.current = ids; setSelected(ids); setLinksReady(true); } }).catch(() => { if (active) setError(t("errorGeneric")); });
    return () => { active = false; };
  }, [subscription, t, linkAttempt]);
  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault(); if (!linksReady || !isValidSubscriptionInput(input) || !user) return;
    setBusy(true); setError("");
    try {
      const saved = savedSubscription.current ?? (subscription ? await apiClient.updateSubscription(subscription, input) : await apiClient.createSubscription({ ...input, name: input.name.trim(), currencyCode: input.currencyCode.toUpperCase(), clientRequestId: requestId.current }));
      savedSubscription.current = saved; setSaved(true);
      const records = [...session.records];
      if (credential.enabled) {
        const key = session.vaultKey; if (!key) throw new Error("Vault locked");
        const plaintext = { schemaVersion: 1 as const, kind: "login" as const, title: input.name, username: credential.username, password: credential.password, url: credential.url, favorite: false, updatedAtUtc: new Date().toISOString() };
        pendingRecord.current ??= encryptVaultRecord(key, user.uid, crypto.randomUUID(), plaintext);
        const encrypted = pendingRecord.current.revision ? pendingRecord.current : await apiClient.createVaultRecord(pendingRecord.current);
        pendingRecord.current = encrypted;
        if (!session.isCurrent(key)) throw new Error("Vault locked");
        if (!records.some(item => item.encrypted.id === encrypted.id)) { records.push({ encrypted, plaintext }); session.setRecords(records); }
        await apiClient.linkVaultRecord(saved, encrypted);
      }
      for (const id of selected) {
        if (original.current.includes(id)) continue;
        const record = records.find(item => item.encrypted.id === id);
        if (!record) throw new Error("Unlock vault before linking");
        await apiClient.linkVaultRecord(saved, record.encrypted);
      }
      for (const id of original.current) if (!selected.includes(id)) await apiClient.unlinkVaultRecord(saved, id);
      store.dispatch(monoKeyApi.util.invalidateTags(["Subscriptions", "Summary", "VaultLinks"])); onClose();
    } catch (caught) { setError(caught instanceof ApiError && caught.status === 409 ? t("conflict") : savedSubscription.current ? t("partialSaved") : t("errorGeneric")); }
    finally { setBusy(false); }
  }
  const update = <K extends keyof SubscriptionInput>(key: K, value: SubscriptionInput[K]): void => setInput(previous => ({ ...previous, [key]: value }));
  return <Dialog title={subscription ? t("edit") : t("addSubscription")} onClose={() => { if (!busy) onClose(); }}><form className="form" onSubmit={event => void submit(event)}>{!linksReady && <p role="status">{error || t("loading")} {error && <button type="button" className="button secondary" onClick={()=>{setError("");setLinkAttempt(value=>value+1);}}>{t("retry")}</button>}</p>}<fieldset className="form" disabled={!linksReady || busy}>
    {!saved && <BrandPicker onSelect={brand=>setInput({...input,name:brand.name.tr,category:brand.category})} />}<div className="field"><label htmlFor="subscription-name">{t("serviceName")}</label><input id="subscription-name" value={input.name} maxLength={200} disabled={saved} required onChange={event => update("name", event.target.value)} /></div>
    <div className="field"><label htmlFor="provider-plan">{t("providerPlan")}</label><input id="provider-plan" disabled={saved} maxLength={100} value={input.providerPlanLabel ?? ""} onChange={event => update("providerPlanLabel", event.target.value)} /></div>
    <div className="form-columns"><div className="field"><label htmlFor="amount">{t("amount")}</label><input id="amount" disabled={saved} type="number" min="0" step="0.01" value={input.amount} onChange={event => update("amount", Number(event.target.value))} required /></div><div className="field"><label htmlFor="currency">{t("currency")}</label><input id="currency" disabled={saved} pattern="[A-Za-z]{3}" maxLength={3} value={input.currencyCode} required onChange={event => update("currencyCode", event.target.value)} /></div></div>
    <div className="form-columns"><div className="field"><label htmlFor="interval">{t("interval")}</label><select id="interval" disabled={saved} value={input.billingIntervalUnit} onChange={event => update("billingIntervalUnit", event.target.value as BillingIntervalUnit)}>{(["Day","Week","Month","Year"] as const).map(unit => <option key={unit} value={unit}>{t(unit.toLowerCase() as "day"|"week"|"month"|"year")}</option>)}</select></div><div className="field"><label htmlFor="interval-count">{t("intervalCount")}</label><input id="interval-count" disabled={saved} type="number" min="1" step="1" value={input.billingIntervalCount} onChange={event => update("billingIntervalCount", Number(event.target.value))} required /></div></div>
    <div className="field"><label htmlFor="renewal">{t("renewalDate")}</label><input id="renewal" disabled={saved} type="date" value={input.nextRenewalDate} onChange={event => update("nextRenewalDate", event.target.value)} required /></div>
    {subscription && <div className="field"><label htmlFor="status">{t("status")}</label><select id="status" disabled={saved} value={input.status ?? subscription.status} onChange={event => update("status", event.target.value as Subscription["status"])}>{(["Active","Paused","Cancelled"] as const).map(status => <option key={status} value={status}>{t(status === "Active" ? "active" : status === "Paused" ? "paused" : "cancelled")}</option>)}</select></div>}
    <div className="form-columns"><div className="field"><label htmlFor="category">{t("category")}</label><input id="category" disabled={saved} maxLength={100} value={input.category ?? ""} onChange={event => update("category", event.target.value)} /></div><div className="field"><label htmlFor="payment-label">{t("paymentLabel")}</label><input id="payment-label" disabled={saved} maxLength={100} value={input.paymentMethodLabel ?? ""} onChange={event => update("paymentMethodLabel", event.target.value)} /></div></div>
    <p className="muted">{t("noCardDetails")}</p><fieldset><legend>{t("linkedCredentials")}</legend>{session.vaultKey ? session.records.map(record => <label className="checkbox-row" key={record.encrypted.id}><input type="checkbox" checked={selected.includes(record.encrypted.id)} onChange={event => setSelected(ids => event.target.checked ? [...ids,record.encrypted.id] : ids.filter(id => id !== record.encrypted.id))} />{record.plaintext.title}</label>) : <p>{t("unlockToLink")}</p>}</fieldset>
    <label className="checkbox-row"><input type="checkbox" disabled={saved || !session.vaultKey} checked={credential.enabled} onChange={event => setCredential({ ...credential, enabled: event.target.checked })} />{t("createLinkedCredential")}</label>
    {credential.enabled && <fieldset className="form"><legend>XChaCha20-Poly1305 · Argon2id</legend><div className="field"><label htmlFor="linked-user">{t("username")}</label><input id="linked-user" disabled={saved} value={credential.username} onChange={event => setCredential({ ...credential, username: event.target.value })} /></div><div className="field"><label htmlFor="linked-password">{t("password")}</label><input id="linked-password" disabled={saved} type="password" autoComplete="new-password" value={credential.password} onChange={event => setCredential({ ...credential, password: event.target.value })} required /></div><PasswordGenerator onUse={value=>setCredential({...credential,password:value})} /><div className="field"><label htmlFor="linked-url">{t("url")}</label><input id="linked-url" disabled={saved} type="url" value={credential.url} onChange={event => setCredential({ ...credential, url: event.target.value })} /></div></fieldset>}
    {error && <p className="error" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? t("loading") : t("save")}</button>
  </fieldset></form></Dialog>;
}

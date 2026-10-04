import { useEffect, useRef, useState } from "react";
import { Alert, Share, Button, Switch, Text, TextInput, View } from "react-native";
import { ApiError } from "@monokey/contracts";
import { useVaultSession } from "../services/VaultSession";
import type { EncryptedVaultRecord, VaultKeyEnvelope, VaultPlaintextRecord } from "@monokey/contracts";
import { clearBytes, rewrapMasterPassphrase, createVault, decryptVaultRecord, encryptVaultRecord, generatePassword, unlockWithMasterPassphrase, unlockWithRecoveryCode } from "@monokey/crypto";
import { Screen } from "../components/Screen";
import { useUi } from "../components/ui";
import { useLocalization } from "../localization";
import { api } from "../services/api";
import { auth } from "../services/firebase";
import { cacheEnvelope, cacheVaultRecords, readEnvelope, readVaultRecords } from "../services/offlineDatabase";
import { mergeEncryptedRecords } from "../services/syncPolicy";

type VisibleRecord = import("../services/VaultSession").VisibleRecord;

export function VaultScreen() { const ui = useUi();
  const user = auth.currentUser!;
  const { t } = useLocalization();
  const [envelope, setEnvelope] = useState<VaultKeyEnvelope | null>(null);
  const session = useVaultSession(); const { key, setKey, records, setRecords, lock } = session;
  const pendingRef = useRef<ReturnType<typeof createVault> | null>(null); const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearBytes(pendingRef.current?.vaultKey); pendingRef.current = null; }; }, []);
  const [passphrase, setPassphrase] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [pending, setPending] = useState<ReturnType<typeof createVault> | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); const [url, setUrl] = useState(""); const [notes, setNotes] = useState(""); const [favorite, setFavorite] = useState(false); const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<VisibleRecord | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { void (async () => { try { const remote = await api.getVaultKeyEnvelope(); setEnvelope(remote); await cacheEnvelope(user.uid, remote); } catch (caught) { if (!(caught instanceof ApiError)) setEnvelope(await readEnvelope(user.uid)); else if (caught.status !== 404) setError(t("unlockFailed")); } })(); }, [user.uid]);
  async function load(nextKey: Uint8Array): Promise<void> { const cached = await readVaultRecords(user.uid); let encrypted: EncryptedVaultRecord[]; try { encrypted = mergeEncryptedRecords(cached, (await api.listVaultRecords()).items); await cacheVaultRecords(user.uid, encrypted); } catch (caught) { if (caught instanceof ApiError) throw caught; encrypted = cached; } if (!session.isCurrent(nextKey)) return; setRecords(encrypted.filter(item => !item.isDeleted).map(item => ({ encrypted: item, plaintext: decryptVaultRecord(nextKey, user.uid, item) }))); }
  async function unlock(): Promise<void> { if (!envelope) return; try { const next = useRecovery ? unlockWithRecoveryCode(recoveryInput.trim(), user.uid, envelope) : unlockWithMasterPassphrase(passphrase, user.uid, envelope); setKey(next); setPassphrase(""); setRecoveryInput(""); setError(""); await load(next); } catch { setError(t("unlockFailed")); } }
  async function completeSetup(): Promise<void> { if (!pending || !confirmed) return; const saved = await api.putVaultKeyEnvelope(pending.envelope); await cacheEnvelope(user.uid, saved); if (!mounted.current || pendingRef.current !== pending) return; setEnvelope(saved); setKey(pending.vaultKey); pendingRef.current = null; setPending(null); }
  async function saveRecord(): Promise<void> {
    if (!key || !title.trim()) return;
    const id = editing?.encrypted.id ?? crypto.randomUUID();
    const plaintext: VaultPlaintextRecord = { schemaVersion: 1, kind: "login", title: title.trim(), username, password, url, notes, favorite, updatedAtUtc: new Date().toISOString() };
    const encrypted = encryptVaultRecord(key, user.uid, id, plaintext);
    let saved: EncryptedVaultRecord;
    if (editing) {
      const expectedRevision = editing.encrypted.revision;
      if (expectedRevision === undefined) throw new Error("The record revision is missing.");
      saved = await api.updateVaultRecord({ ...encrypted, expectedRevision });
    } else {
      saved = await api.createVaultRecord(encrypted);
    }
    const next = [...records.filter(item => item.encrypted.id !== id), { encrypted: saved, plaintext }];
    if (!key || !session.isCurrent(key)) return;
    setRecords(next); await cacheVaultRecords(user.uid, next.map(item => item.encrypted)); setTitle(""); setPassword(""); setUsername(""); setUrl(""); setNotes(""); setFavorite(false); setEditing(null);
  }
  async function removeRecord(item: VisibleRecord): Promise<void> {
    if (item.encrypted.revision === undefined) return;
    const tombstone = await api.deleteVaultRecord(item.encrypted.id, item.encrypted.revision);
    const next = records.filter(value => value.encrypted.id !== item.encrypted.id);
    if (!key || !session.isCurrent(key)) return;
    setRecords(next); await cacheVaultRecords(user.uid, [...next.map(value => value.encrypted), tombstone]);
  }

  if (pending) return <Screen><Text style={ui.title}>{t("recoveryCode")}</Text><Text style={ui.error}>{t("recoveryWarning")}</Text><Text selectable style={ui.body}>{pending.recoveryCode}</Text><View style={ui.row}><Switch value={confirmed} onValueChange={setConfirmed} /><Text style={ui.body}>{t("recoveryConfirmed")}</Text></View><Button title={t("completeSetup")} disabled={!confirmed} onPress={() => void completeSetup().catch(() => setError(t("saveFailed")))} /></Screen>;
  if (!envelope) return <Screen><Text style={ui.title}>{t("setupVault")}</Text><TextInput accessibilityLabel={t("masterPassphrase")} secureTextEntry style={ui.input} value={passphrase} onChangeText={setPassphrase} /><Button title={t("createVault")} disabled={passphrase.length < 12} onPress={() => { try { const setup = createVault(passphrase, user.uid); pendingRef.current = setup; setPending(setup); setPassphrase(""); } catch { setError(t("longerPassphrase")); } }} />{error ? <Text style={ui.error}>{error}</Text> : null}</Screen>;
  if (!key) return <Screen><Text style={ui.title}>{t("vaultLocked")}</Text><Text style={ui.body}>{t("lockedPrivacy")}</Text>{useRecovery ? <TextInput accessibilityLabel={t("recoveryCode")} style={ui.input} value={recoveryInput} onChangeText={setRecoveryInput} /> : <TextInput accessibilityLabel={t("masterPassphrase")} secureTextEntry style={ui.input} value={passphrase} onChangeText={setPassphrase} />}<Button title={t("unlock")} onPress={() => void unlock()} /><Button title={t("recoveryCode")} onPress={() => setUseRecovery(value => !value)} />{error ? <Text style={ui.error}>{error}</Text> : null}</Screen>;
  return <Screen>
    <View style={ui.row}><Text style={ui.title}>{t("vault")}</Text><Button title={t("lock")} onPress={lock} /></View>
    <TextInput accessibilityLabel={t("search")} value={search} onChangeText={setSearch} style={ui.input} placeholder={t("search")} />
    <View style={ui.card}><TextInput accessibilityLabel={t("title")} style={ui.input} value={title} onChangeText={setTitle} placeholder={t("title")} /><TextInput accessibilityLabel={t("password")} secureTextEntry style={ui.input} value={password} onChangeText={setPassword} placeholder={t("password")} /><TextInput accessibilityLabel={t("username")} style={ui.input} value={username} onChangeText={setUsername} placeholder={t("username")} /><TextInput accessibilityLabel={t("url")} style={ui.input} value={url} onChangeText={setUrl} placeholder={t("url")} /><TextInput accessibilityLabel={t("notes")} multiline style={ui.input} value={notes} onChangeText={setNotes} placeholder={t("notes")} /><View style={ui.row}><Switch value={favorite} onValueChange={setFavorite} /><Text style={ui.body}>{t("favorite")}</Text></View><Button title={t("generatePassword")} onPress={() => setPassword(generatePassword())} /><Button title={t("addEncryptedRecord")} onPress={() => void saveRecord().catch(() => setError(t("saveFailed")))} /></View>
    <View style={ui.card}><Text style={ui.heading}>{t("changeMaster")}</Text><TextInput accessibilityLabel={t("masterPassphrase")} style={ui.input} secureTextEntry value={passphrase} onChangeText={setPassphrase} /><Button title={t("edit")} disabled={passphrase.length < 12} onPress={() => { const updated = rewrapMasterPassphrase(key, passphrase, user.uid, envelope); void api.putVaultKeyEnvelope(updated).then(saved => { setEnvelope(saved); setPassphrase(""); return cacheEnvelope(user.uid, saved); }).catch(() => setError(t("saveFailed"))); }} /></View>
    <Button title={t("exportVault")} onPress={() => void Share.share({message: JSON.stringify(records.map(item => item.plaintext))}).catch(() => setError(t("saveFailed")))} />
    {error ? <Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text> : null}
    {records.filter(item => `${item.plaintext.title} ${item.plaintext.username ?? ""}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(item => <View key={item.encrypted.id} style={ui.card}><Text style={ui.heading}>{item.plaintext.title}</Text><Text selectable style={ui.body}>{revealedId === item.encrypted.id ? item.plaintext.password : t("sessionOnly")}</Text><View style={ui.row}><Button title={revealedId === item.encrypted.id ? "••••" : t("password")} onPress={() => setRevealedId(revealedId === item.encrypted.id ? null : item.encrypted.id)} /><Button title={t("edit")} onPress={() => { setEditing(item); setTitle(item.plaintext.title); setPassword(item.plaintext.password ?? ""); setUsername(item.plaintext.username ?? ""); setUrl(item.plaintext.url ?? ""); setNotes(item.plaintext.notes ?? ""); setFavorite(item.plaintext.favorite); }} /><Button title={t("delete")} color="#B42318" onPress={() => Alert.alert("MonoKey", t("deleteConfirm"), [{ text: t("cancel"), style: "cancel" }, { text: t("delete"), style: "destructive", onPress: () => void removeRecord(item).catch(() => setError(t("saveFailed"))) }])} /></View></View>)}
  </Screen>;
}

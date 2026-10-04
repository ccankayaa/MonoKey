import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ApiError, MonoKeyApiClient, type EncryptedVaultRecord, type Membership, type Plan, type VaultPlaintextRecord } from "@monokey/contracts";
import { clearBytes, decryptVaultRecord, unlockWithMasterPassphrase } from "@monokey/crypto";
import { canFill } from "./policy";
import "./styles.css";

import { messages, type Locale, type Appearance } from "./preferences";
import { environment } from "./environment";
const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);
const auth = getAuth(firebaseApp);
if (environment.authEmulatorUrl) connectAuthEmulator(auth, environment.authEmulatorUrl);
const api = new MonoKeyApiClient(environment.apiBaseUrl, { getIdToken: async (force?: boolean) => { const user=auth.currentUser; if(!user) return null; const token=await user.getIdToken(force); return auth.currentUser?.uid===user.uid ? token : null; } }, environment.environment === "dev");
const root = document.querySelector<HTMLElement>("#app")!;
let vaultKey: Uint8Array | null = null;
let decrypted: Array<{ encrypted: EncryptedVaultRecord; plaintext: VaultPlaintextRecord }> = [];

let locale: Locale = "tr"; let appearance: Appearance = "system";
const t = (key: keyof typeof messages.en): string => messages[locale][key];
const scheme = matchMedia("(prefers-color-scheme: dark)");
function applyTheme(): void { document.documentElement.dataset.theme = appearance === "dark" || appearance === "system" && scheme.matches ? "dark" : "light"; }
scheme.addEventListener("change", applyTheme); applyTheme();
void chrome.storage.local.get("monokey.preferences").then(values => { const prefs=values["monokey.preferences"] as {locale?:unknown;appearance?:unknown}|undefined; if(prefs?.locale === "tr" || prefs?.locale === "en") locale=prefs.locale; if(prefs?.appearance === "system" || prefs?.appearance === "light" || prefs?.appearance === "dark") appearance=prefs.appearance; applyTheme(); render(auth.currentUser ? "locked" : "auth"); });
let membership: Membership | null = null; let plans: Plan[] = [];
let generation = 0;
let previousUid: string | undefined;
onAuthStateChanged(auth, user => { generation++; clearBytes(vaultKey); vaultKey = null; decrypted = []; if(previousUid && previousUid !== user?.uid) void chrome.storage.local.remove(`${environment.cacheNamespace}:${previousUid}`); previousUid=user?.uid; membership=null; plans=[]; render(user ? "locked" : "auth"); if(user) { const current=generation; void Promise.all([api.getMembership(),api.getPlans()]).then(([m,p])=>{if(current===generation && auth.currentUser?.uid===user.uid){membership=m;plans=p;render(vaultKey ? "records" : "locked");}}).catch(()=>undefined); } });
addEventListener("unload", () => { clearBytes(vaultKey); vaultKey = null; decrypted = []; });
chrome.runtime.onMessage.addListener(message => {
  if ((message as { type?: string }).type === "monokey:lock") lock();
});

function render(view: "auth" | "locked" | "records", message = ""): void {
  if (view === "auth") root.innerHTML = `<h1>Mono Key</h1><p>${t("signInHint")}</p><label>${t("email")}<input id="email" type="email" autocomplete="email"></label><label>${t("password")}<input id="password" type="password" autocomplete="current-password"></label><button id="sign-in">${t("signIn")}</button><p role="alert">${escapeText(message)}</p>`;
  if (view === "locked") root.innerHTML = `<h1>${t("locked")}</h1><p>${t("privacy")}</p><label>${t("master")}<input id="master" type="password" autocomplete="off"></label><button id="unlock">${t("unlock")}</button><button id="sign-out" class="secondary">${t("signOut")}</button><p role="alert">${escapeText(message)}</p>`;
  if (view === "records") root.innerHTML = `<header><h1>Mono Key</h1><button id="lock" class="secondary">${t("lock")}</button></header><p>${t("fillHint")}</p><ul>${decrypted.map((item, index) => `<li><strong>${escapeText(item.plaintext.title)}</strong><span>${escapeText(item.plaintext.username ?? "")}</span><button data-fill="${index}">${t("fill")}</button></li>`).join("") || `<li>${t("empty")}</li>`}</ul>`;
  if (view !== "auth" && membership) {
    const limits=plans.find(plan=>plan.id.toLowerCase()===membership!.plan.toLowerCase());
    const paragraph=document.createElement("p");
    paragraph.textContent=`${membership.plan} ? ${membership.status}${limits?.vaultRecordLimit == null ? "" : ` ? ${t("limit")}: ${limits.vaultRecordLimit}`}`;
    root.prepend(paragraph);
  }
  root.insertAdjacentHTML("beforeend", `<footer><label>${t("language")}<select id="locale"><option value="tr" ${locale==="tr"?"selected":""}>T?rk?e</option><option value="en" ${locale==="en"?"selected":""}>English</option></select></label><label>${t("appearance")}<select id="appearance">${(["system","light","dark"] as const).map(value=>`<option value="${value}" ${appearance===value?"selected":""}>${t(value)}</option>`).join("")}</select></label></footer>`);
  document.querySelector("#locale")?.addEventListener("change", event => { const value=(event.target as HTMLSelectElement).value; if(value==="tr"||value==="en") locale=value; savePreferences(view); });
  document.querySelector("#appearance")?.addEventListener("change", event => { const value=(event.target as HTMLSelectElement).value; if(value==="system"||value==="light"||value==="dark") appearance=value; savePreferences(view); });
  bind(view);
}

function savePreferences(view: "auth" | "locked" | "records"): void { applyTheme(); void chrome.storage.local.set({"monokey.preferences": {locale,appearance}}); render(view); }

function bind(view: "auth" | "locked" | "records"): void {
  if (view === "auth") document.querySelector("#sign-in")?.addEventListener("click", () => void login());
  if (view === "locked") {
    document.querySelector("#unlock")?.addEventListener("click", () => void unlock());
    document.querySelector("#sign-out")?.addEventListener("click", () => void signOut(auth));
  }
  if (view === "records") {
    document.querySelector("#lock")?.addEventListener("click", lock);
    for (const button of document.querySelectorAll<HTMLButtonElement>("[data-fill]")) button.addEventListener("click", () => void fill(Number(button.dataset.fill)));
  }
}

async function login(): Promise<void> {
  const email = document.querySelector<HTMLInputElement>("#email")?.value ?? "";
  const password = document.querySelector<HTMLInputElement>("#password")?.value ?? "";
  try { await signInWithEmailAndPassword(auth, email, password); } catch { render("auth", t("loginFailed")); }
}

async function unlock(): Promise<void> {
  const passphrase = document.querySelector<HTMLInputElement>("#master")?.value ?? "";
  const user = auth.currentUser; if (!user) return; const current = generation;
  try {
    const envelope = await api.getVaultKeyEnvelope();
    if (current !== generation || auth.currentUser?.uid !== user.uid) return;
    const nextKey = unlockWithMasterPassphrase(passphrase, user.uid, envelope); vaultKey = nextKey;
    const master = document.querySelector<HTMLInputElement>("#master"); if (master) master.value = "";
    let encrypted: EncryptedVaultRecord[];
    try { encrypted = (await api.listVaultRecords()).items; if(current !== generation || vaultKey !== nextKey || auth.currentUser?.uid !== user.uid) { clearBytes(nextKey); return; } await chrome.storage.local.set({ [`${environment.cacheNamespace}:${user.uid}`]: encrypted }); }
    catch (caught) { if (caught instanceof ApiError) throw caught; encrypted = (await chrome.storage.local.get(`${environment.cacheNamespace}:${user.uid}`))[`${environment.cacheNamespace}:${user.uid}`] as EncryptedVaultRecord[] ?? []; }
    if (current !== generation || vaultKey !== nextKey || auth.currentUser?.uid !== user.uid) { clearBytes(nextKey); return; }
    decrypted = encrypted.filter(item => !item.isDeleted).map(item => ({ encrypted: item, plaintext: decryptVaultRecord(nextKey, user.uid, item) }));
    render("records");
  } catch { if (current === generation) { lock(); render(auth.currentUser ? "locked" : "auth", t("unlockFailed")); } }
}

function lock(): void { generation++; clearBytes(vaultKey); vaultKey = null; decrypted = []; render(auth.currentUser ? "locked" : "auth"); }

async function fill(index: number): Promise<void> {
  const item = decrypted[index]; if (!item?.plaintext.url || !item.plaintext.username || !item.plaintext.password) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || !canFill(item.plaintext.url, tab.url, 0)) { render("records", t("originDenied")); return; }
  await chrome.scripting.executeScript({
    target: { tabId: tab.id, frameIds: [0] },
    func: (username: string, password: string) => {
      const userField = document.querySelector<HTMLInputElement>('input[autocomplete="username"], input[type="email"], input[name*="user" i]');
      const passwordField = document.querySelector<HTMLInputElement>('input[autocomplete="current-password"], input[type="password"]');
      if (!userField || !passwordField) return;
      userField.focus(); userField.value = username; userField.dispatchEvent(new Event("input", { bubbles: true }));
      passwordField.focus(); passwordField.value = password; passwordField.dispatchEvent(new Event("input", { bubbles: true }));
    },
    args: [item.plaintext.username, item.plaintext.password],
  });
  window.close();
}

function escapeText(value: string): string { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

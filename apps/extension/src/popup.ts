import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { findBrand, normalizeLoginEmail, authenticationMessage, ApiError, MonoKeyApiClient, type EncryptedVaultRecord, type Membership, type Plan, type VaultPlaintextRecord } from "@monokey/contracts";
import { clearBytes, decryptVaultRecord, unlockWithMasterPassphrase, generatePassword, passwordEntropyUpperBound } from "@monokey/crypto";
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
  if (view === "records") root.innerHTML = `<header><h1>Mono Key</h1><button id="lock" class="secondary">${t("lock")}</button></header><p>${t("fillHint")}</p><ul>${decrypted.map((item, index) => `<li>${brandImage(item.plaintext.title)}<strong>${escapeText(item.plaintext.title)}</strong><span>${escapeText(item.plaintext.username ?? "")}</span><button data-fill="${index}">${t("fill")}</button></li>`).join("") || `<li>${t("empty")}</li>`}</ul>`;
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
  if (view === "records") mountGenerator();
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
  try { await signInWithEmailAndPassword(auth, normalizeLoginEmail(email), password); } catch (caught) { render("auth", authenticationMessage(caught,locale)); }
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
    func: (username: string, password: string, origin: string) => {
      if (location.origin !== origin || location.protocol !== "https:") return;
      const userField = document.querySelector<HTMLInputElement>('input[autocomplete="username"], input[type="email"], input[name*="user" i]');
      const passwordField = document.querySelector<HTMLInputElement>('input[autocomplete="current-password"], input[type="password"]');
      if (!userField || !passwordField) return;
      userField.focus(); userField.value = username; userField.dispatchEvent(new Event("input", { bubbles: true }));
      passwordField.focus(); passwordField.value = password; passwordField.dispatchEvent(new Event("input", { bubbles: true }));
    },
    args: [item.plaintext.username, item.plaintext.password, new URL(item.plaintext.url).origin],
  });
  window.close();
}

function escapeText(value: string): string { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

function brandImage(name:string):string {const brand=findBrand(name);return brand?.asset?`<img width="28" height="28" loading="lazy" src="brands/${brand.asset}" alt="" />`:"";}
function mountGenerator():void {
 const section=document.createElement("section");section.innerHTML=`<details><summary>${locale==="tr"?"Güvenli parola üret":"Secure password generator"}</summary><label>${locale==="tr"?"Uzunluk":"Length"}<input id="generator-length" type="number" min="16" max="128" value="20"></label>${["uppercase","lowercase","digits","symbols","excludeAmbiguous"].map((key,i)=>`<label><input type="checkbox" id="generator-${key}" checked>${locale==="tr"?["Büyük harf","Küçük harf","Rakam","Sembol","Benzer karakterleri çıkar"][i]:["Uppercase","Lowercase","Digits","Symbols","Exclude ambiguous"][i]}</label>`).join("")}<button id="generator-generate">${locale==="tr"?"Üret / Yenile":"Generate / Regenerate"}</button><input id="generator-value" type="password" autocomplete="off" readonly aria-label="${locale==="tr"?"Üretilen parola":"Generated password"}"><button id="generator-reveal">${locale==="tr"?"Göster / Gizle":"Reveal / Hide"}</button><button id="generator-copy">${locale==="tr"?"Kopyala":"Copy"}</button><label>${locale==="tr"?"Tam kaynağı eşleştirmek için kayıt":"Record to match the exact origin"}<select id="generator-record">${decrypted.map((item,index)=>`<option value="${index}">${escapeText(item.plaintext.title)}</option>`).join("")}</select></label><button id="generator-use">${locale==="tr"?"Bu sayfanın yeni parola alanında kullan":"Use in this page's new-password field"}</button><small>${locale==="tr"?"Kasa kaydı otomatik güncellenmez. Parola yalnızca bu açık oturumda kalır.":"Vault records are not automatically updated. Passwords remain only in this open session."}</small><p id="generator-status" role="status"></p></details>`;root.append(section);
 const output=section.querySelector<HTMLInputElement>("#generator-value")!;const status=section.querySelector<HTMLElement>("#generator-status")!;
 section.querySelector("#generator-generate")!.addEventListener("click",()=>{try{const options={length:Number(section.querySelector<HTMLInputElement>("#generator-length")!.value),uppercase:section.querySelector<HTMLInputElement>("#generator-uppercase")!.checked,lowercase:section.querySelector<HTMLInputElement>("#generator-lowercase")!.checked,digits:section.querySelector<HTMLInputElement>("#generator-digits")!.checked,symbols:section.querySelector<HTMLInputElement>("#generator-symbols")!.checked,excludeAmbiguous:section.querySelector<HTMLInputElement>("#generator-excludeAmbiguous")!.checked};output.value=generatePassword(options);status.textContent=`${Math.floor(passwordEntropyUpperBound(options))} bits · ${locale==="tr"?"Alfabe/uzunluk üst tahmini; ölçülen entropi değildir.":"Alphabet/length upper estimate; not measured entropy."}`;}catch{status.textContent=locale==="tr"?"16–128 uzunluk ve en az bir karakter türü seçin.":"Choose length 16–128 and at least one class.";}});
 section.querySelector("#generator-reveal")!.addEventListener("click",()=>{output.type=output.type==="password"?"text":"password";});
 section.querySelector("#generator-copy")!.addEventListener("click",()=>{if(output.value)void navigator.clipboard.writeText(output.value).catch(()=>{status.textContent=locale==="tr"?"Panoya erişilemedi.":"Clipboard unavailable.";});});
 section.querySelector("#generator-use")!.addEventListener("click",()=>void(async()=>{const record=decrypted[Number(section.querySelector<HTMLSelectElement>("#generator-record")!.value)];const value=output.value;if(!vaultKey || !record?.plaintext.url || !value)return;const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id || !tab.url || !canFill(record.plaintext.url,tab.url,0)){status.textContent=t("originDenied");return;}const origin=new URL(record.plaintext.url).origin;await chrome.scripting.executeScript({target:{tabId:tab.id,frameIds:[0]},func:(value:string,origin:string)=>{if(location.origin!==origin || location.protocol!=="https:")return;const field=document.querySelector<HTMLInputElement>('input[autocomplete="new-password"]');if(field){field.value=value;field.dispatchEvent(new Event("input",{bubbles:true}));}},args:[value,origin]});output.value="";window.close();})().catch(()=>{status.textContent=t("originDenied");}));
}

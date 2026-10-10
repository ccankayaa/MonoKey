import { PasswordGenerator } from "../../components/PasswordGenerator";
import { useRef, useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { authenticationMessage, normalizeLoginEmail, safeAuthCode, type AuthOperation } from "@monokey/contracts";
import { appleProvider, auth, firebaseConfigured, googleProvider } from "../../app/firebase";
import { BrandLogo } from "../../components/BrandLogo";
import { useTranslation } from "../../i18n/useTranslation";

export function AuthPage() {
  const { t, locale } = useTranslation();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [create, setCreate] = useState(false); const [reset, setReset] = useState(false);
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function run(operation: AuthOperation, action: () => Promise<unknown>): Promise<void> {
    if (!auth || pending.current) return;
    pending.current = true; setBusy(true); setError(null);
    try { await action(); }
    catch (caught) {
      setError(authenticationMessage(caught, locale));
      dispatchEvent(new CustomEvent("monokey:auth-error", { detail: { operation, code: safeAuthCode(caught), correlationId: crypto.randomUUID() } }));
    } finally { pending.current = false; setBusy(false); }
  }
  function submit(event: FormEvent): void {
    event.preventDefault();
    void run(create ? "register" : "login", async () => {
      const normalized = normalizeLoginEmail(email);
      if (password.length < 6) throw { code: "auth/weak-password" };
      // Password bytes are never trimmed or case-normalized.
      if (create) await createUserWithEmailAndPassword(auth!, normalized, password);
      else await signInWithEmailAndPassword(auth!, normalized, password);
      setPassword("");
    });
  }
  function sendReset(event: FormEvent): void {
    event.preventDefault();
    void run("reset-send", async () => {
      const normalized = normalizeLoginEmail(email); auth!.languageCode = locale;
      try { await sendPasswordResetEmail(auth!, normalized, { url: `${location.origin}/`, handleCodeInApp: false }); }
      catch (caught) { if (!["auth/user-not-found", "auth/invalid-credential"].includes(safeAuthCode(caught))) throw caught; }
      setError(t("resetSent"));
    });
  }
  return <main className="auth-page"><section className="card auth-card" aria-labelledby="auth-heading">
    <BrandLogo /><h1 id="auth-heading">{reset ? (locale === "tr" ? "Şifremi unuttum" : "Forgot password?") : t(create ? "signUp" : "signIn")}</h1>
    <p className="muted">{t("welcome")}</p>
    {!firebaseConfigured && <p className="banner error" role="alert">{t("authConfigMissing")}</p>}
    <form className="form" noValidate onSubmit={reset ? sendReset : submit}>
      <div className="field"><label htmlFor="email">{t("email")}</label><input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
      {!reset && <div className="field"><label htmlFor="password">{t("password")}</label><input id="password" type="password" autoComplete={create ? "new-password" : "current-password"} minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></div>}
      {create && !reset && <PasswordGenerator onUse={setPassword} />}
      {error && <p role="alert">{error}</p>}
      <button className="button" disabled={busy || !firebaseConfigured} type="submit">{busy ? t("loading") : reset ? t("resetPassword") : t(create ? "signUp" : "signIn")}</button>
      <button className="auth-link" type="button" disabled={busy} onClick={() => { setReset(!reset); setError(null); setPassword(""); }}>{reset ? t("signIn") : locale === "tr" ? "Şifremi unuttum" : "Forgot password?"}</button>
      {!reset && <button className="auth-link" type="button" disabled={busy} onClick={() => { setCreate(!create); setError(null); }}>{t(create ? "signIn" : "signUp")}</button>}
    </form>
    {!reset && <div className="provider-buttons">
      <button className="google-sign-in" disabled={busy || !auth} type="button" onClick={() => void run("google", () => signInWithPopup(auth!, googleProvider))}><img src="/auth/google-g.png" alt="" width="20" height="20" />{t("google")}</button>
      <button className="apple-sign-in" disabled={busy || !auth || import.meta.env.VITE_ENABLE_APPLE_SIGN_IN !== "true"} type="button" aria-label={t("apple")} aria-describedby="apple-status" onClick={() => void run("apple", () => signInWithPopup(auth!, appleProvider))}><img src={`/auth/apple-${locale}-black.png`} alt="" width="320" height="44" /></button>
      {import.meta.env.VITE_ENABLE_APPLE_SIGN_IN !== "true" && <small id="apple-status">{t("appleUnavailable")}</small>}
    </div>}
    <p className="muted">{t("passwordDistinction")} {t("recoveryWarning")}</p>
  </section></main>;
}

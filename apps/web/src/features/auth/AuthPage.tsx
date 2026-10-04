import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { appleProvider, auth, firebaseConfigured, googleProvider } from "../../app/firebase";
import { BrandLogo } from "../../components/BrandLogo";
import { useTranslation } from "../../i18n/useTranslation";

export function AuthPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent, create: boolean): Promise<void> {
    event.preventDefault();
    if (!auth) return;
    setBusy(true); setError(null);
    try {
      if (create) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch { setError(t("errorGeneric")); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <section className="card auth-card" aria-labelledby="auth-heading">
      <BrandLogo />
      <h1 id="auth-heading">{t("signIn")}</h1><p className="muted">{t("welcome")}</p>
      {!firebaseConfigured && <p className="banner error" role="alert">{t("authConfigMissing")}</p>}
      <form className="form" onSubmit={event => void submit(event, false)}>
        <div className="field"><label htmlFor="email">{t("email")}</label><input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div className="field"><label htmlFor="password">{t("password")}</label><input id="password" type="password" autoComplete="current-password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required /></div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button className="button" disabled={busy || !firebaseConfigured} type="submit">{t("signIn")}</button>
          <button className="button secondary" disabled={busy || !firebaseConfigured} type="button" onClick={event => void submit(event, true)}>{t("signUp")}</button>
        </div>
        <button className="button secondary" disabled={busy || !auth} type="button" onClick={() => auth && void signInWithPopup(auth, googleProvider).catch(() => setError(t("errorGeneric")))}>{t("google")}</button>
        <button className="button secondary" type="button" disabled={busy || !email || !auth} onClick={() => auth && void sendPasswordResetEmail(auth, email).then(() => setError(t("resetSent"))).catch(() => setError(t("errorGeneric")))}>{t("resetPassword")}</button>
        <button className="button secondary" disabled={busy || !auth || import.meta.env.VITE_ENABLE_APPLE_SIGN_IN !== "true"} type="button" title={t("appleUnavailable")} onClick={() => auth && void signInWithPopup(auth, appleProvider).catch(() => setError(t("errorGeneric")))}>{t("apple")}</button>
      </form>
    </section>
  </main>;
}

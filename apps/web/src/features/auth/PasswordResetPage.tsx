import { PasswordGenerator } from "../../components/PasswordGenerator";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { authenticationMessage } from "@monokey/contracts";
import { auth } from "../../app/firebase";
import { BrandLogo } from "../../components/BrandLogo";
import { useTranslation } from "../../i18n/useTranslation";

export function PasswordResetPage() {
  const { t, locale } = useTranslation();
  const [code] = useState(() => new URLSearchParams(location.search).get("oobCode"));
  const [ready, setReady] = useState(false); const [complete, setComplete] = useState(false);
  const [password, setPassword] = useState(""); const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState(() => !auth || !code ? authenticationMessage({ code: "auth/invalid-action-code" }, locale) : ""); const [busy, setBusy] = useState(false); const pending = useRef(false);
  useEffect(() => {
    // Code remains only in component memory; remove all sensitive action parameters.
    history.replaceState(null, "", "/auth/reset"); let active = true;
    if (!auth || !code) return;
    void verifyPasswordResetCode(auth, code).then(() => { if (active) setReady(true); }).catch(caught => { if (active) setError(authenticationMessage(caught, locale)); });
    return () => { active = false; };
  }, [code, locale]);
  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault(); if (!auth || !code || !ready || pending.current) return;
    if (password !== confirmation) { setError(locale === "tr" ? "Parolalar eşleşmiyor." : "Passwords do not match."); return; }
    pending.current = true; setBusy(true); setError("");
    try { await confirmPasswordReset(auth, code, password); setComplete(true); setReady(false); }
    catch (caught) { setError(authenticationMessage(caught, locale)); }
    finally { setPassword(""); setConfirmation(""); setBusy(false); pending.current = false; }
  }
  return <main className="auth-page"><section className="card auth-card"><BrandLogo /><h1>{locale === "tr" ? "Yeni giriş parolası" : "New sign-in password"}</h1>
    <p>{t("passwordDistinction")} {t("recoveryWarning")}</p>
    {error && <p role="alert">{error}</p>}
    {!ready && !error && !complete && <p role="status">{t("loading")}</p>}
    {complete && <p role="status">{t("saved")}</p>}
    {ready && <form className="form" onSubmit={event => void submit(event)}><label htmlFor="new-password">{t("password")}</label><input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} /><PasswordGenerator onUse={setPassword} /><label htmlFor="confirm-password">{locale === "tr" ? "Parolayı tekrar girin" : "Confirm password"}</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={e => setConfirmation(e.target.value)} /><button className="button" disabled={busy}>{t("save")}</button></form>}
    <a className="auth-link" href="/">{t("signIn")}</a>
  </section></main>;
}

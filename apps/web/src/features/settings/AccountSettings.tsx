import { useState, type FormEvent } from "react";
import { EmailAuthProvider, GoogleAuthProvider, OAuthProvider, linkWithCredential, linkWithPopup, reauthenticateWithCredential, reauthenticateWithPopup, sendEmailVerification, sendPasswordResetEmail, unlink, updatePassword, verifyBeforeUpdateEmail } from "firebase/auth";
import { auth } from "../../app/firebase";
import { monoKeyApi, useProfileQuery, useUpdateProfileMutation } from "../../app/api";
import { store } from "../../app/store";
import { useAuth } from "../auth/AuthContext";
import { useVaultSession } from "../vault/VaultSession";
import { useTranslation } from "../../i18n/useTranslation";

export function AccountSettings() {
  const { user } = useAuth(); const { t } = useTranslation(); const session = useVaultSession();
  const profile = useProfileQuery(undefined); const [saveProfile] = useUpdateProfileMutation();
  const [name, setName] = useState<string | null>(null); const [currentPassword, setCurrentPassword] = useState("");
  const [email, setEmail] = useState(""); const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false); const [, refresh] = useState(0);
  async function run(action: () => Promise<unknown>): Promise<void> {
    setBusy(true); setStatus("");
    try { await action(); if (user) { await user.reload(); await user.getIdToken(true); } refresh(value => value + 1); store.dispatch(monoKeyApi.util.invalidateTags(["Profile"])); setStatus(t("saved")); if(auth?.currentUser?.uid===user?.uid) dispatchEvent(new CustomEvent("monokey:account-status",{detail:t("saved")})); }
    catch (caught) { const code = (caught as { code?: string }).code; setStatus(code === "auth/requires-recent-login" ? t("recentLoginRequired") : code === "auth/credential-already-in-use" || code === "auth/account-exists-with-different-credential" ? t("providerConflict") : t("errorGeneric")); if(auth?.currentUser?.uid===user?.uid) dispatchEvent(new CustomEvent("monokey:account-status",{detail:t("errorGeneric")})); }
    finally { setBusy(false); setCurrentPassword(""); setNewPassword(""); }
  }
  async function reauthenticate(): Promise<void> {
    if (!user) throw new Error("Missing user"); session.lock();
    if (user.providerData.some(item => item.providerId === "password") && user.email) await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    else if (user.providerData.some(item => item.providerId === "google.com")) await reauthenticateWithPopup(user, new GoogleAuthProvider());
    else if (import.meta.env.VITE_ENABLE_APPLE_SIGN_IN === "true") await reauthenticateWithPopup(user, new OAuthProvider("apple.com"));
    else throw new Error("Provider unavailable");
  }
  async function changeEmail(event: FormEvent): Promise<void> { event.preventDefault(); await run(async () => { await reauthenticate(); if (user) await verifyBeforeUpdateEmail(user, email); }); }
  async function changePassword(event: FormEvent): Promise<void> {
    event.preventDefault(); await run(async () => { await reauthenticate(); if (!user || !user.email) return;
      if (user.providerData.some(item => item.providerId === "password")) await updatePassword(user, newPassword);
      else await linkWithCredential(user, EmailAuthProvider.credential(user.email, newPassword));
    });
  }
  function mayUnlink(providerId: string): boolean { return Boolean(user && user.providerData.length > 1 && user.providerData.some(item => item.providerId !== providerId && (item.providerId !== "password" || user.emailVerified))); }
  return <section className="card form"><h2>{t("account")}</h2><form className="form" onSubmit={event => { event.preventDefault(); void run(() => saveProfile(name ?? profile.data?.displayName ?? "").unwrap()); }}><div className="field"><label htmlFor="profile-name">{t("displayName")}</label><input id="profile-name" maxLength={200} value={name ?? profile.data?.displayName ?? ""} onChange={event => setName(event.target.value)} /></div><button className="button" disabled={busy}>{t("save")}</button></form>
    <p>{user?.email}</p>{!user?.emailVerified && <button className="button secondary" disabled={busy} onClick={() => void run(async () => { if (user) await sendEmailVerification(user); })}>{t("verifyEmail")}</button>}
    <div className="field"><label htmlFor="current-login-password">{t("currentLoginPassword")}</label><input id="current-login-password" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></div>
    <form className="form" onSubmit={event => void changeEmail(event)}><div className="field"><label htmlFor="new-email">{t("newEmail")}</label><input id="new-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required /></div><button className="button secondary" disabled={busy}>{t("changeEmail")}</button></form><p className="muted">{t("verifiedEmailChange")}</p>
    <form className="form" onSubmit={event => void changePassword(event)}><div className="field"><label htmlFor="new-login-password">{t("newLoginPassword")}</label><input id="new-login-password" type="password" minLength={12} autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required /></div><button className="button secondary" disabled={busy}>{t("changeLoginPassword")}</button></form>
    <button className="button secondary" disabled={busy || !user?.email} onClick={() => void run(async () => { if (auth && user?.email) await sendPasswordResetEmail(auth, user.email); })}>{t("resetPassword")}</button>
    <h3>{t("providers")}</h3><p className="muted">{t("providerUnlinkWarning")}</p>{["password", "google.com", "apple.com"].map(provider => {
      const linked = user?.providerData.some(item => item.providerId === provider);
      const appleUnavailable = provider === "apple.com" && import.meta.env.VITE_ENABLE_APPLE_SIGN_IN !== "true";
      return <div className="provider-row" key={provider}><span>{provider} · {linked ? t("linked") : t("notLinked")}</span>{linked ? <button className="button secondary" disabled={busy || !mayUnlink(provider) || appleUnavailable} onClick={() => void run(async () => { if (!user || !mayUnlink(provider)) throw new Error("Last verified provider"); await reauthenticate(); await unlink(user, provider); })}>{t("unlink")}</button> : provider !== "password" && <button className="button secondary" disabled={busy || appleUnavailable} onClick={() => void run(async () => { await reauthenticate(); if (user) await linkWithPopup(user, provider === "google.com" ? new GoogleAuthProvider() : new OAuthProvider("apple.com")); })}>{appleUnavailable ? t("appleUnavailable") : t("linkProvider")}</button>}</div>;
    })}<p className="muted">{t("passwordDistinction")}</p><p role="status">{status}</p>
  </section>;
}

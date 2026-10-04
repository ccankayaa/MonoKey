import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../app/firebase";
import { useTranslation } from "../i18n/useTranslation";
import { useEffect, useState } from "react";
import { useMembershipQuery, useProfileQuery } from "../app/api";
import { useAuth } from "../features/auth/AuthContext";
import { BrandLogo } from "../components/BrandLogo";
import { Icon } from "../components/Icon";
import { Dialog } from "../components/Dialog";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { useRenewalReminders } from "../features/settings/useRenewalReminders";
const links = [["/", "dashboard"], ["/subscriptions", "subscriptions"], ["/vault", "vault"], ["/settings", "settings"]] as const;
function Navigation({mobile = false}: {mobile?: boolean}) {
  const {t} = useTranslation(); const navigate = useNavigate();
  return <nav className={mobile ? "mobile-nav" : "nav"} aria-label={t("navigation")}>
    {links.map(([to,key],index) => <span className="nav-slot" key={to}>{mobile && index === 2 && <button className="mobile-add" aria-label={t("addSubscription")} onClick={() => navigate("/subscriptions?new=1")}><Icon name="plus" size={28}/></button>}<NavLink to={to} end={to === "/"}><Icon name={key}/><span>{t(key)}</span></NavLink></span>)}
  </nav>;
}
export function AppLayout() {
  const {t,locale} = useTranslation(); const {user} = useAuth(); const navigate=useNavigate();
  const [online,setOnline] = useState(navigator.onLine); const [notifications,setNotifications]=useState(false); const [error,setError]=useState(false);
  const [accountStatus,setAccountStatus]=useState("");
  useEffect(()=>{const update=(event:Event):void=>{const detail=(event as CustomEvent<unknown>).detail;if(typeof detail==="string") setAccountStatus(detail);};addEventListener("monokey:account-status",update);return()=>removeEventListener("monokey:account-status",update);},[]);
  const membership=useMembershipQuery(undefined); const profile=useProfileQuery(undefined); const {upcoming,preference,enabled}=useRenewalReminders();
  const name=profile.data?.displayName || user?.displayName || user?.email?.split("@")[0] || t("account");
  useEffect(() => { const update=():void=>setOnline(navigator.onLine); addEventListener("online",update);addEventListener("offline",update);return()=>{removeEventListener("online",update);removeEventListener("offline",update);}; },[]);
  async function logout():Promise<void> { try { if(auth) await signOut(auth); } catch { setError(true); } }
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><BrandLogo/></div><NavLink className="plan-badge" to="/membership">{membership.data?.plan ?? "—"} {t("plan")}</NavLink><Navigation/><button className="logout" onClick={()=>void logout()}><Icon name="logout"/>{t("signOut")}</button></aside>
    <div className="main-column"><header className="top-header"><div><h1>{t("greeting")}, {name}</h1><p><Icon name="lock" size={12}/>{t("vaultEncrypted")}</p></div><div className="header-actions"><button className="icon-button" aria-label={t("search")} onClick={()=>navigate("/vault")}><Icon name="search"/></button><button className="icon-button" aria-label={t("upcomingRenewals")} onClick={()=>setNotifications(true)}><Icon name="bell"/>{Boolean(upcoming.data?.length) && <span className="notification-dot"/>}</button><NavLink to="/settings" className="avatar" aria-label={t("settings")}><ProfileAvatar displayName={name} identityPhotoUrl={user?.photoURL}/></NavLink></div></header>
    <main className="content">{accountStatus && <p role="status" className="banner">{accountStatus}</p>}<Outlet/>{error && <p role="alert" className="error">{t("errorGeneric")}</p>}</main></div><Navigation mobile/>{!online && <div className="offline" role="status">{t("offline")}</div>}
    {notifications && <Dialog title={t("upcomingRenewals")} onClose={()=>setNotifications(false)}><p className="muted">{t("notificationsLocal")}</p>{upcoming.isLoading && <p>{t("loading")}</p>}{(upcoming.isError||preference.isError) && <p role="alert">{t("errorGeneric")}</p>}{!enabled && <p>{t("remindersDisabled")}</p>}<ul className="list">{upcoming.data?.map(item=><li className="list-item" key={item.id}>{item.name}<span>{new Intl.DateTimeFormat(locale).format(new Date(item.nextRenewalDate+"T00:00:00"))}</span></li>)}</ul>{enabled && upcoming.data?.length===0 && <p>{t("noRenewals")}</p>}</Dialog>}
  </div>;
}

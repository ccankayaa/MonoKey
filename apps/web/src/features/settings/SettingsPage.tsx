import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setAppearance, setLocale, type Appearance, type Locale } from "../../app/preferencesSlice";
import { useTranslation } from "../../i18n/useTranslation";
import { AccountSettings } from "./AccountSettings";
import { Link } from "react-router-dom";
import { RenewalSettings } from "./RenewalSettings";

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(state => state.preferences);
  const { t } = useTranslation();
  return <><header className="page-header"><h1>{t("settings")}</h1></header><section className="card form">
    <div className="field"><label htmlFor="locale">{t("language")}</label><select id="locale" value={preferences.locale} onChange={event => dispatch(setLocale(event.target.value as Locale))}><option value="tr">Türkçe</option><option value="en">English</option></select></div>
    <div className="field"><label htmlFor="appearance">{t("appearance")}</label><select id="appearance" value={preferences.appearance} onChange={event => dispatch(setAppearance(event.target.value as Appearance))}><option value="system">{t("system")}</option><option value="light">{t("light")}</option><option value="dark">{t("dark")}</option></select></div>
    <p className="muted">{t("sessionPolicy")}</p>
  </section><RenewalSettings/><AccountSettings /><Link to="/membership">{t("membership")}</Link></>;
}

export function ThemeEffect() {
  const appearance = useAppSelector(state => state.preferences.appearance);
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const apply = (): void => {
      const dark = appearance === "dark" || (appearance === "system" && query.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    apply(); query.addEventListener("change", apply); return () => query.removeEventListener("change", apply);
  }, [appearance]);
  return null;
}

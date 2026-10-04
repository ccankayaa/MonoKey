import { useState } from "react";
import type { NotificationPreferenceInput } from "@monokey/contracts";
import { useNotificationPreferenceQuery, useUpdateNotificationPreferenceMutation } from "../../app/api";
import { useTranslation } from "../../i18n/useTranslation";

export function RenewalSettings() {
  const {t} = useTranslation();
  const query = useNotificationPreferenceQuery(undefined);
  const [update, mutation] = useUpdateNotificationPreferenceMutation();
  const [draft, setDraft] = useState<NotificationPreferenceInput | null>(null);
  const [saved, setSaved] = useState(false);
  const value = draft ?? query.data ?? {renewalRemindersEnabled: true, daysBeforeRenewal: 7};
  const valid = Number.isInteger(value.daysBeforeRenewal) && value.daysBeforeRenewal >= 0 && value.daysBeforeRenewal <= 365;
  async function save(): Promise<void> {
    setSaved(false);
    try {await update({renewalRemindersEnabled: value.renewalRemindersEnabled, daysBeforeRenewal: value.daysBeforeRenewal}).unwrap(); setDraft(null);setSaved(true);} catch { /* Mutation state shows the failure. */ }
  }
  return <section className="card form"><h2>{t("renewalPreferences")}</h2><p className="muted">{t("notificationsLocal")}</p>
    {query.isLoading && <p role="status">{t("loading")}</p>}
    {query.isError && <p role="alert">{t("errorGeneric")} <button className="button secondary" onClick={()=>void query.refetch()}>{t("retry")}</button></p>}
    {query.data === null && <p className="muted">{t("renewalDefaults")}</p>}
    <div className="field"><label htmlFor="renewal-reminders"><input id="renewal-reminders" type="checkbox" checked={value.renewalRemindersEnabled} disabled={query.data===undefined || mutation.isLoading} onChange={event=>{setDraft({...value,renewalRemindersEnabled:event.target.checked});setSaved(false);}}/> {t("renewalReminders")}</label></div>
    <div className="field"><label htmlFor="reminder-days">{t("daysBeforeRenewal")}</label><input id="reminder-days" type="number" min="0" max="365" step="1" value={Number.isNaN(value.daysBeforeRenewal)?"":value.daysBeforeRenewal} disabled={query.data===undefined || mutation.isLoading} onChange={event=>{setDraft({...value,daysBeforeRenewal:event.target.value===""?Number.NaN:Number(event.target.value)});setSaved(false);}}/></div>
    <button className="button" disabled={query.data===undefined || !valid || mutation.isLoading} onClick={()=>void save()}>{t("save")}</button>
    {mutation.isError && <p role="alert">{t("errorGeneric")}</p>}{saved && <p role="status">{t("saved")}</p>}
  </section>;
}

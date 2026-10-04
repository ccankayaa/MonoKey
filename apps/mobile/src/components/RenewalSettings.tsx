import { useEffect, useState } from "react";
import { Button, Switch, Text, TextInput, View } from "react-native";
import type { NotificationPreferenceInput } from "@monokey/contracts";
import { api } from "../services/api";
import { useLocalization } from "../localization";
import { useUi } from "./ui";

export function RenewalSettings() {
  const ui=useUi();const {t}=useLocalization();
  const [value,setValue]=useState<NotificationPreferenceInput>({renewalRemindersEnabled:true,daysBeforeRenewal:7});
  const [loaded,setLoaded]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [retry,setRetry]=useState(0);
  useEffect(()=>{const controller=new AbortController();setLoaded(false);void api.getNotificationPreference(controller.signal).then(preference=>{if(!controller.signal.aborted){setValue(preference??{renewalRemindersEnabled:true,daysBeforeRenewal:7});setLoaded(true);setMessage(preference?"":t("renewalDefaults"));}}).catch(()=>{if(!controller.signal.aborted)setMessage(t("errorGeneric"));});return()=>controller.abort();},[retry,t]);
  const valid=Number.isInteger(value.daysBeforeRenewal) && value.daysBeforeRenewal>=0 && value.daysBeforeRenewal<=365;
  async function save():Promise<void>{setBusy(true);try{const saved=await api.updateNotificationPreference(value);setValue(saved);setMessage(t("saved"));}catch{setMessage(t("errorGeneric"));}finally{setBusy(false);}}
  return <View style={ui.card}><Text style={ui.heading}>{t("renewalPreferences")}</Text><Text style={ui.body}>{t("notificationsLocal")}</Text><Text style={ui.body}>{t("renewalReminders")}</Text><Switch accessibilityLabel={t("renewalReminders")} disabled={!loaded||busy} value={value.renewalRemindersEnabled} onValueChange={enabled=>setValue({...value,renewalRemindersEnabled:enabled})}/><Text style={ui.body}>{t("daysBeforeRenewal")}</Text><TextInput accessibilityLabel={t("daysBeforeRenewal")} keyboardType="number-pad" editable={loaded&&!busy} style={ui.input} value={Number.isNaN(value.daysBeforeRenewal)?"":String(value.daysBeforeRenewal)} onChangeText={text=>setValue({...value,daysBeforeRenewal:text===""?Number.NaN:Number(text)})}/><Button title={t("save")} disabled={!loaded||busy||!valid} onPress={()=>void save()}/>{!loaded&&<Button title={t("retry")} disabled={busy} onPress={()=>setRetry(value=>value+1)}/>}<Text accessibilityLiveRegion="polite" style={ui.body}>{message}</Text></View>;
}

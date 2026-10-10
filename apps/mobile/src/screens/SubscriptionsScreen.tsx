import { BrandPicker, BrandImage } from "../components/BrandPicker";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Switch, Text, TextInput, View } from "react-native";
import { ApiError, type Subscription, type SubscriptionInput, type BillingIntervalUnit } from "@monokey/contracts";
import { Screen } from "../components/Screen";
import { useUi } from "../components/ui";
import { api } from "../services/api";
import { auth } from "../services/firebase";
import { cacheSubscriptions, readSubscriptions } from "../services/offlineDatabase";
import { useLocalization } from "../localization";
import { useVaultSession } from "../services/VaultSession";
const empty: SubscriptionInput = {name:"",amount:0,currencyCode:"TRY",billingIntervalUnit:"Month",billingIntervalCount:1,nextRenewalDate:"",status:"Active",providerPlanLabel:"",category:"",paymentMethodLabel:""};
export function SubscriptionsScreen() {
 const ui=useUi(); const {t,locale}=useLocalization(); const session=useVaultSession(); const [items,setItems]=useState<Subscription[]>([]); const [input,setInput]=useState<SubscriptionInput>(empty); const [editing,setEditing]=useState<Subscription | null>(null); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [selected,setSelected]=useState<string[]>([]); const original=useRef<string[]>([]); const requestId=useRef(crypto.randomUUID()); const saved=useRef<Subscription | null>(null); const [partial,setPartial]=useState(false);
 async function load():Promise<void> {const user=auth.currentUser; if(!user)return; try {const remote=await api.listSubscriptions(); setItems(remote.items); await cacheSubscriptions(user.uid,remote.items); setError("");} catch(caught) { if (!(caught instanceof ApiError)) {setItems(await readSubscriptions(user.uid)); setError(t("offlineCache"));} else setError(t("saveFailed"));}}
 useEffect(() => {void load();}, []);
 const update=<K extends keyof SubscriptionInput>(key:K,value:SubscriptionInput[K]):void=>setInput(previous=>({...previous,[key]:value}));
 async function submit():Promise<void> {setBusy(true);setError("");try {
  const current=saved.current ?? (editing?await api.updateSubscription(editing,input):await api.createSubscription({...input,clientRequestId:requestId.current})); saved.current=current;setPartial(true);
  for(const id of selected) {if(original.current.includes(id))continue;const record=session.records.find(item=>item.encrypted.id===id);if(!session.key || !record)throw new Error("Unlock vault");await api.linkVaultRecord(current,record.encrypted);}
  for(const id of original.current)if(!selected.includes(id))await api.unlinkVaultRecord(current,id);
  reset(); await load();
 }catch(caught){setError(caught instanceof ApiError && caught.status===409?t("conflict"):saved.current?t("partialSaved"):t("saveFailed"));}finally{setBusy(false);}}
 function reset():void {saved.current=null;setPartial(false);setInput(empty);setEditing(null);setSelected([]);original.current=[];requestId.current=crypto.randomUUID();}
 async function edit(item:Subscription):Promise<void> {try {const links=await api.listVaultLinks(item.id);reset();setEditing(item);setInput(item);original.current=links.map(x=>x.vaultRecordId);setSelected(original.current);}catch{setError(t("saveFailed"));}}
 async function remove(item:Subscription):Promise<void> {try{await api.deleteSubscription(item);await load();}catch(caught){setError(caught instanceof ApiError && caught.status===409?t("conflict"):t("saveFailed"));}}
 const valid=input.name.trim().length>0 && Number.isFinite(input.amount) && input.amount>=0 && /^[A-Z]{3}$/.test(input.currencyCode) && /^\d{4}-\d{2}-\d{2}$/.test(input.nextRenewalDate) && input.billingIntervalCount>0 && Number.isInteger(input.billingIntervalCount);
 return <Screen><Text accessibilityRole="header" style={ui.title}>{t("subscriptions")}</Text>{error?<Text accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>:null}<View style={ui.card}>
 <BrandPicker onSelect={brand=>{if(!partial)setInput({...input,name:brand.name.tr,category:brand.category});}} /><TextInput editable={!partial} accessibilityLabel={t("serviceName")} style={ui.input} value={input.name} onChangeText={value=>update("name",value)} placeholder={t("serviceName")} />
 <TextInput editable={!partial} accessibilityLabel={t("amount")} keyboardType="decimal-pad" style={ui.input} value={String(input.amount)} onChangeText={value=>update("amount",Number(value.replace(",",".")))} placeholder={t("amount")} />
 <TextInput editable={!partial} accessibilityLabel={t("currency")} autoCapitalize="characters" maxLength={3} style={ui.input} value={input.currencyCode} onChangeText={value=>update("currencyCode",value.toUpperCase())} />
 <Text style={ui.body}>{t("interval")}: {input.billingIntervalUnit}</Text><View style={ui.row}>{(["Day","Week","Month","Year"] as BillingIntervalUnit[]).map(unit=><Button key={unit} title={unit} disabled={partial||unit===input.billingIntervalUnit} onPress={()=>update("billingIntervalUnit",unit)} />)}</View>
 <TextInput editable={!partial} accessibilityLabel={t("intervalCount")} keyboardType="number-pad" style={ui.input} value={String(input.billingIntervalCount)} onChangeText={value=>update("billingIntervalCount",Number(value))} />
 <TextInput editable={!partial} accessibilityLabel={t("renewal")} style={ui.input} value={input.nextRenewalDate} onChangeText={value=>update("nextRenewalDate",value)} placeholder={t("renewal")} />
 <Text style={ui.body}>{t("status")}: {input.status}</Text><View style={ui.row}>{(["Active","Paused","Cancelled"] as const).map(status=><Button key={status} title={status} disabled={!editing || partial || input.status===status} onPress={()=>update("status",status)} />)}</View>
 {session.key ? session.records.map(record=><View key={record.encrypted.id} style={ui.row}><Switch value={selected.includes(record.encrypted.id)} onValueChange={value=>setSelected(ids=>value?[...ids,record.encrypted.id]:ids.filter(id=>id!==record.encrypted.id))} /><Text style={ui.body}>{record.plaintext.title}</Text></View>):<Text style={ui.body}>{t("unlockToLink")}</Text>}
 <Button title={editing?t("save"):t("addSubscription")} disabled={busy||!valid} onPress={()=>void submit()} /><Button title={t("cancel")} disabled={busy} onPress={reset}/></View>
 {items.map(item=><View key={item.id} style={ui.card}><BrandImage name={item.name} /><Text style={ui.heading}>{item.name}</Text><Text style={ui.body}>{new Intl.NumberFormat(locale,{style:"currency",currency:item.currencyCode}).format(item.amount)} · {item.billingIntervalCount} {item.billingIntervalUnit} · {item.status}</Text><Text style={ui.body}>{item.nextRenewalDate}</Text><View style={ui.row}><Button title={t("edit")} onPress={()=>void edit(item)}/><Button title={t("delete")} color="#B42318" onPress={()=>Alert.alert("Mono Key",t("deleteConfirm"),[{text:t("cancel"),style:"cancel"},{text:t("delete"),style:"destructive",onPress:()=>void remove(item)}])}/></View></View>)}
 </Screen>;
}

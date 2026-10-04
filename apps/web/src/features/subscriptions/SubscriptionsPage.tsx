import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Subscription, SubscriptionInput } from "@monokey/contracts";
import { useDeleteSubscriptionMutation, useSubscriptionsQuery } from "../../app/api";
import { useTranslation } from "../../i18n/useTranslation";
import { ServiceLogo, serviceManagementUrl } from "../../components/ServiceLogo";
import { LinkedCredentials } from "./LinkedCredentials";
import { SubscriptionDialog } from "./SubscriptionDialog";
export function isValidSubscriptionInput(input: SubscriptionInput): boolean {
  return Boolean(input.name.trim()) && input.name.trim().length<=200 && Number.isFinite(input.amount) && input.amount>=0 && /^[A-Za-z]{3}$/.test(input.currencyCode) && /^\d{4}-\d{2}-\d{2}$/.test(input.nextRenewalDate) && Number.isInteger(input.billingIntervalCount) && input.billingIntervalCount>0;
}
export function SubscriptionsPage() {
  const {t,locale}=useTranslation();const query=useSubscriptionsQuery(undefined);const [remove]=useDeleteSubscriptionMutation();const [parameters,setParameters]=useSearchParams();
  const [editing,setEditing]=useState<Subscription|null>(null);const [show,setShow]=useState(false);const [error,setError]=useState("");
  const open=show||parameters.get("new")==="1";
  function close():void {setShow(false);setEditing(null);setParameters({});}
  async function deleteItem(item:Subscription):Promise<void> {if(!confirm(t("delete")))return;try{await remove(item).unwrap();setError("");}catch(caught){setError((caught as {status?:number}).status===409?t("conflict"):t("errorGeneric"));}}
  return <><header className="page-header"><div><h1>{t("subscriptions")}</h1><p>{t("subscriptionsDescription")}</p></div><button className="button" onClick={()=>{setEditing(null);setShow(true);}}>{t("addSubscription")}</button></header>
    {open&&<SubscriptionDialog subscription={editing} onClose={close}/>} {query.isLoading&&<p role="status">{t("loading")}</p>}{(query.isError||error)&&<p role="alert" className="error">{error||t("errorGeneric")} <button className="button secondary" onClick={()=>void query.refetch()}>{t("retry")}</button></p>}
    {query.data?.items.length===0&&<p className="card muted">{t("emptySubscriptions")}</p>}<section className="subscription-grid">{query.data?.items.map(item=><article className="card subscription-card" key={item.id}><div className="service-heading"><ServiceLogo name={item.name}/><div><h2>{item.name}</h2><p className="muted">{item.providerPlanLabel||t("providerPlanUnspecified")}</p></div><span className={item.status==="Active"?"status-active":"status-inactive"} aria-label={t(item.status==="Active"?"active":item.status==="Paused"?"paused":"cancelled")}/></div><div className="subscription-details"><div><span className="muted">{t("amount")}</span><strong>{new Intl.NumberFormat(locale,{style:"currency",currency:item.currencyCode}).format(item.amount)}</strong><small>{item.billingIntervalCount} {t(item.billingIntervalUnit.toLowerCase() as "month"|"year"|"week"|"day")}</small></div><div><span className="muted">{t("renewalDate")}</span><strong>{new Intl.DateTimeFormat(locale).format(new Date(item.nextRenewalDate+"T00:00:00"))}</strong></div></div><LinkedCredentials subscriptionId={item.id}/><footer className="actions"><button className="button secondary" onClick={()=>{setEditing(item);setShow(true);}}>{t("edit")}</button><button className="button danger" onClick={()=>void deleteItem(item)}>{t("delete")}</button>{serviceManagementUrl(item.name)&&<a href={serviceManagementUrl(item.name)!} target="_blank" rel="noopener noreferrer">{t("providerAccount")}</a>}</footer></article>)}</section><p className="muted">{t("localCancellationOnly")}</p>
  </>;
}

import { useEffect, useRef, useState } from "react";
import { useVaultLinksQuery } from "../../app/api";
import { useVaultSession } from "../vault/VaultSession";
import { useTranslation } from "../../i18n/useTranslation";
import { Icon } from "../../components/Icon";
export function LinkedCredentials({subscriptionId}: {subscriptionId:string}) {
 const element=useRef<HTMLSpanElement>(null);const [visible,setVisible]=useState(false);const {t}=useTranslation();const session=useVaultSession();
 useEffect(()=>{const node=element.current;if(!node)return;const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:"100px"});observer.observe(node);return()=>observer.disconnect();},[]);
 const query=useVaultLinksQuery(subscriptionId,{skip:!visible});
 const titles=query.data?.flatMap(link=>{const record=session.records.find(item=>item.encrypted.id===link.vaultRecordId);return record?[record.plaintext.title]:[];});
 return <span ref={element} className="link-indicator">{query.data && query.data.length>0 && <span className="success" title={session.vaultKey?titles?.join(", "):t("linkedCredentials")}><Icon name="link" size={14}/> {query.data.length} {t("linkedCredentials")}</span>}</span>;
}

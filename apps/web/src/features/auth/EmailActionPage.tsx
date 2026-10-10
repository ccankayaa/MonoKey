import { useEffect, useState, type FormEvent } from "react";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { authenticationMessage } from "@monokey/contracts";
import { auth } from "../../app/firebase";
import { useTranslation } from "../../i18n/useTranslation";
import { BrandLogo } from "../../components/BrandLogo";
const operations:Record<string,string>={verifyEmail:"VERIFY_EMAIL",recoverEmail:"RECOVER_EMAIL",verifyAndChangeEmail:"VERIFY_AND_CHANGE_EMAIL"};
export function EmailActionPage(){const {locale,t}=useTranslation();const [action]=useState(()=>{const params=new URLSearchParams(location.search);return {code:params.get("oobCode"),mode:params.get("mode")??""};});const [ready,setReady]=useState(false),[complete,setComplete]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(()=>!action.code||!operations[action.mode]?authenticationMessage({code:"auth/invalid-action-code"},locale):"");
 useEffect(()=>{history.replaceState(null,"","/auth/action");if(!auth||!action.code||!operations[action.mode])return;let active=true;void checkActionCode(auth,action.code).then(info=>{if(info.operation!==operations[action.mode])throw {code:"auth/invalid-action-code"};if(active)setReady(true);}).catch(e=>{if(active)setError(authenticationMessage(e,locale));});return()=>{active=false;};},[action,locale]);
 async function confirm(event:FormEvent):Promise<void>{event.preventDefault();if(!auth||!action.code||!ready||busy)return;setBusy(true);try{await applyActionCode(auth,action.code);setComplete(true);setReady(false);await auth.currentUser?.reload();}catch(e){setError(authenticationMessage(e,locale));}finally{setBusy(false);}}
 return <main className="auth-page"><section className="card auth-card"><BrandLogo /><h1>{locale==="tr"?"Hesap işlemini doğrulayın":"Confirm the account action"}</h1>{error&&<p role="alert">{error}</p>}{!ready&&!error&&!complete&&<p role="status">{t("loading")}</p>}{complete&&<p role="status">{t("saved")}</p>}{ready&&<form onSubmit={e=>void confirm(e)}><button className="button" disabled={busy}>{locale==="tr"?"Doğrula":"Confirm"}</button></form>}<a className="auth-link" href="/">{t("signIn")}</a></section></main>;
}

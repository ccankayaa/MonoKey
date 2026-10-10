import type { ApplicationEnvironment } from "./environment.js";
export interface EmailActionInput {mode:"resetPassword"|"verifyEmail"|"recoverEmail"|"verifyAndChangeEmail";code:string}
export function parseEmailActionLink(value:string,environment:ApplicationEnvironment):EmailActionInput|null {
 try{const url=new URL(value);const hosts=environment==="test"?["icy-mud-054dd8e0f.4.azurestaticapps.net","test.my.monokeyapp.com"]:environment==="prod"?["my.monokeyapp.com"]:["localhost","127.0.0.1"];
 const web=(environment==="dev"?url.protocol==="http:"&&url.port==="5173":url.protocol==="https:"&&(url.port===""||url.port==="443"))&&hosts.includes(url.hostname);
 const scheme=environment==="prod"?"monokey:":`monokey-${environment}:`;
 const native=url.protocol===scheme&&url.hostname==="auth";
 if(url.username||url.password||!(web||native)||!['/auth/action','/auth/reset','/action','/reset'].includes(url.pathname))return null;
 const mode=url.searchParams.get('mode'),code=url.searchParams.get('oobCode');
 if(!code||!/^[a-zA-Z0-9_-]{1,1024}$/.test(code)||!['resetPassword','verifyEmail','recoverEmail','verifyAndChangeEmail'].includes(mode??''))return null;
 return {mode:mode as EmailActionInput['mode'],code};
 }catch{return null;}
}

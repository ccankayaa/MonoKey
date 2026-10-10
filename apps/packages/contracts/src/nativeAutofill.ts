import type { VaultPlaintextRecord } from "./index.js";
export interface NativeAutofillRequest {id:string;packageName:string;certificateSha256:string}
export function matchesNativeApplication(record:VaultPlaintextRecord,request:NativeAutofillRequest):boolean {
 const binding=record.nativeAutofill?.android;
 return Boolean(record.kind==="login" && record.username && record.password && binding && /^[A-Z0-9]{64}$/.test(binding.certificateSha256) && binding.packageName===request.packageName && binding.certificateSha256===request.certificateSha256);
}

export interface CredentialService {identifier:string;type:"domain"|"url"}
export function matchesCredentialService(saved:string,requested:CredentialService):boolean {
 try{const url=new URL(saved);if(url.protocol!=="https:" || url.username || url.password)return false;
  if(requested.type==="domain")return (!url.port || url.port==="443") && url.hostname===requested.identifier.toLowerCase();
  const target=new URL(requested.identifier);return target.protocol==="https:" && !target.username && !target.password && target.origin===url.origin;
 }catch{return false;}
}

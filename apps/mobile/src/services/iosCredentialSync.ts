import type { EncryptedVaultRecord } from "@monokey/contracts";
import { ApiError } from "@monokey/contracts";
import { decryptVaultRecord } from "@monokey/crypto";
import { Platform } from "react-native";
import { nativeAutofill } from "./nativeAutofill";
import { auth } from "./firebase";
import { api } from "./api";
import type { VisibleRecord } from "./VaultSession";
export async function importProviderSaves(uid:string,key:Uint8Array):Promise<EncryptedVaultRecord[]> {
 if(Platform.OS!=="ios" || !nativeAutofill || auth.currentUser?.uid!==uid)return [];
 const pending=await nativeAutofill.pendingSavedRecords?.().catch(()=>[]) ?? [];
 for(const record of pending.slice(0,100)){
  if(auth.currentUser?.uid!==uid)return [];
  try{
   const plain=decryptVaultRecord(key,uid,record);
   if(plain.kind!=="login" || !plain.url || new URL(plain.url).protocol!=="https:")continue;
   try{await api.createVaultRecord(record);}catch(error){
    if(!(error instanceof ApiError) || error.status!==409)throw error;
    const remote=(await api.listVaultRecords()).items.find((value:EncryptedVaultRecord)=>value.id===record.id);
    if(!remote || remote.nonce!==record.nonce || remote.ciphertext!==record.ciphertext)continue;
   }
   await nativeAutofill.acknowledgeSavedRecord(record.id);
  }catch{ /* Encrypted pending saves remain local for the next authenticated vault unlock. */ }
 }
 return await nativeAutofill.pendingSavedRecords?.().catch(()=>[]) ?? [];
}
export async function publishProviderIdentities(records:VisibleRecord[]):Promise<void>{
 if(Platform.OS!=="ios" || !nativeAutofill)return;
 const items=records.flatMap(({encrypted,plaintext})=>{
  if(plaintext.kind!=="login" || !plaintext.url || !plaintext.username || !plaintext.password)return [];
  try{const url=new URL(plaintext.url);if(url.protocol!=="https:" || url.username || url.password)return [];return [{id:encrypted.id,origin:url.origin,username:plaintext.username}];}catch{return [];}
 }).slice(0,500);
 await nativeAutofill.registerCredentialIdentities?.(JSON.stringify(items));
}

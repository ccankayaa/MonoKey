import { matchesCredentialService } from "../../../packages/contracts/src/nativeAutofill";
import { clearBytes, decryptVaultRecord, unlockWithMasterPassphrase, unlockWithRecoveryCode } from "../../../packages/crypto/src/index";
import type { EncryptedVaultRecord, VaultKeyEnvelope } from "../../../packages/contracts/src/index";
interface Snapshot {version:1;namespace:string;uid:string;envelope:VaultKeyEnvelope;records:EncryptedVaultRecord[]}
interface Service {identifier:string;type:"domain"|"url"}
let snapshot:Snapshot|null=null;
let services:Service[]=[];
let key:Uint8Array|null=null;
let choices:Array<{id:string;username:string;password:string;title:string}>=[];
const bridge=window as unknown as {webkit:{messageHandlers:{monokey:{postMessage:(message:unknown)=>void}}};MonoKeyCredentialProvider:unknown};

function lock():void {clearBytes(key);key=null;choices=[];}
bridge.MonoKeyCredentialProvider={
 configure(payload:Snapshot, requested:Service[]):void {lock();snapshot=payload;services=requested;},
 unlock(passphrase:string,recovery:boolean):void {
  lock();try {
   if(!snapshot || snapshot.version!==1)throw Error("Invalid ciphertext snapshot");
   key=recovery?unlockWithRecoveryCode(passphrase,snapshot.uid,snapshot.envelope):unlockWithMasterPassphrase(passphrase,snapshot.uid,snapshot.envelope);
   choices=snapshot.records.filter(record=>!record.isDeleted).flatMap(record=>{const plain=decryptVaultRecord(key!,snapshot!.uid,record);return plain.kind==="login" && plain.url && plain.username && plain.password && services.some(service=>matchesCredentialService(plain.url!,service)) ? [{id:record.id,username:plain.username,password:plain.password,title:plain.title}]:[];});
   bridge.webkit.messageHandlers.monokey.postMessage({type:"choices",items:choices.map(({id,title,username})=>({id,title,username}))});
  }catch{lock();bridge.webkit.messageHandlers.monokey.postMessage({type:"failure"});}
 },
 select(id:string):void {const choice=choices.find(value=>value.id===id);if(!key || !choice)return;bridge.webkit.messageHandlers.monokey.postMessage({type:"credential",username:choice.username,password:choice.password});lock();},
 lock,
};
window.addEventListener("pagehide",lock);

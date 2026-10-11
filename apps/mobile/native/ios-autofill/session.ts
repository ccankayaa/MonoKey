import type { EncryptedVaultRecord, VaultKeyEnvelope } from "../../../packages/contracts/src/index";
import { matchesCredentialService, type CredentialService } from "../../../packages/contracts/src/nativeAutofill";
import { clearBytes, decryptVaultRecord, encryptVaultRecord, generatePassword, unlockWithMasterPassphrase, unlockWithRecoveryCode, type PasswordOptions } from "../../../packages/crypto/src/index";
export interface CipherSnapshot {version:1; namespace:string; uid:string; envelope:VaultKeyEnvelope; records:EncryptedVaultRecord[]}
export function credentialOrigin(service:CredentialService):string {
 const url=new URL(service.type==="domain"?`https://${service.identifier}`:service.identifier);
 if(url.protocol!=="https:" || url.username || url.password || (service.type==="domain" && url.host!==service.identifier.toLowerCase()))throw Error("Invalid credential service");
 return url.origin;
}
export function generateForRules(rules:readonly string[]):string {
 let minimum=16,maximum=128,consecutive=128;
 const allowed=new Set(["upper","lower","digit","special"]),required=new Set<string>();
 for(const rule of rules)for(const clause of rule.split(";")){if(!clause.trim())continue;
  const [name,value,...extra]=clause.split(":").map(x=>x.trim());if(extra.length || !name || !value)throw Error("Unsupported password rules");
  if(["minlength","maxlength","max-consecutive"].includes(name)){if(!/^\d+$/u.test(value))throw Error("Invalid password bound");const count=Number(value);if(name==="minlength")minimum=Math.max(minimum,count);else if(name==="maxlength")maximum=Math.min(maximum,count);else consecutive=Math.min(consecutive,count);}
  else if(name==="allowed" || name==="required"){const classes=value.split(",").map(x=>x.trim());if(classes.some(x=>!["upper","lower","digit","special","ascii-printable"].includes(x)))throw Error("Unsupported password alphabet");if(name==="allowed" && !classes.includes("ascii-printable"))for(const current of allowed)if(!classes.includes(current))allowed.delete(current);if(name==="required")for(const current of classes)if(current!=="ascii-printable")required.add(current);}
  else throw Error("Unsupported password rules");
 }
 if(minimum>maximum || maximum<16 || minimum>128 || consecutive<1 || !allowed.size || [...required].some(x=>!allowed.has(x)))throw Error("Unsupported password rules");
 const options:PasswordOptions={length:Math.max(minimum,Math.min(20,maximum)),uppercase:allowed.has("upper"),lowercase:allowed.has("lower"),digits:allowed.has("digit"),symbols:allowed.has("special")};
 for(let attempt=0;attempt<512;attempt++){const value=generatePassword(options);let run=1,valid=true;for(let i=1;i<value.length;i++){run=value[i]===value[i-1]?run+1:1;if(run>consecutive){valid=false;break;}}if(valid)return value;}
 throw Error("Password rules could not be met");
}
export class CredentialSession {
 private key:Uint8Array|null=null;
 private snapshot:CipherSnapshot|null=null;
 private services:CredentialService[]=[];
 private selectedId:string|null=null;
 private expires=0;
 private choices:Array<{id:string;title:string;username:string;password:string}>=[];
 configure(snapshot:CipherSnapshot,services:CredentialService[],selectedIdentity?:string):void {
  this.lock();this.snapshot=null;this.services=[];this.expires=0;
  if(snapshot.version!==1 || !snapshot.uid || !services.length || services.length>32 || snapshot.records.length>5000)throw Error("Invalid snapshot");services.forEach(credentialOrigin);
  const prefix=`${snapshot.namespace}|${snapshot.uid}|`;
  if(selectedIdentity && !selectedIdentity.startsWith(prefix))throw Error("Credential belongs to another account");
  this.snapshot=snapshot;this.services=services;this.selectedId=selectedIdentity?.slice(prefix.length) ?? null;this.expires=Date.now()+120_000;
 }
 unlock(passphrase:string,recovery:boolean):Array<{id:string;title:string;username:string}> {
  this.lock();const s=this.snapshot;if(!s || Date.now()>this.expires)throw Error("Expired request");
  this.key=recovery?unlockWithRecoveryCode(passphrase,s.uid,s.envelope):unlockWithMasterPassphrase(passphrase,s.uid,s.envelope);
  try{this.choices=s.records.filter(record=>!record.isDeleted && (!this.selectedId || record.id===this.selectedId)).flatMap(record=>{const plain=decryptVaultRecord(this.key!,s.uid,record);return plain.kind==="login" && plain.url && plain.username && plain.password && this.services.some(service=>matchesCredentialService(plain.url!,service))?[{id:record.id,title:plain.title,username:plain.username,password:plain.password}]:[];});return this.choices.map(({id,title,username})=>({id,title,username}));}catch(error){this.lock();throw error;}
 }
 select(id:string):{username:string;password:string} {this.requireUnlocked();const choice=this.choices.find(x=>x.id===id);if(!choice)throw Error("Unmatched credential");const result={username:choice.username,password:choice.password};this.lock();return result;}
 generate(rules:readonly string[]):string {this.requireUnlocked();return generateForRules(rules);}
 save(username:string,password:string):EncryptedVaultRecord {
  this.requireUnlocked();if(!username || username.length>512 || !password || password.length>4096 || this.services.length!==1)throw Error("Invalid save request");
  const url=credentialOrigin(this.services[0]!);const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]!&15)|64;bytes[8]=(bytes[8]!&63)|128;const hex=[...bytes].map(x=>x.toString(16).padStart(2,"0")).join("");const id=`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  return encryptVaultRecord(this.key!,this.snapshot!.uid,id,{schemaVersion:1,kind:"login",title:new URL(url).hostname,url,username,password,favorite:false,updatedAtUtc:new Date().toISOString()});
 }
 lock():void {clearBytes(this.key);this.key=null;this.choices=[];}
 private requireUnlocked():void {if(!this.key || Date.now()>this.expires){this.lock();throw Error("Vault locked or expired");}}
}

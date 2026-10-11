import { CredentialSession, type CipherSnapshot } from "./session";
import type { CredentialService } from "../../../packages/contracts/src/nativeAutofill";
const session=new CredentialSession();
const bridge=window as unknown as {webkit:{messageHandlers:{monokey:{postMessage:(message:unknown)=>void}}};MonoKeyCredentialProvider:unknown};
function run(action:()=>void):void {try{action();}catch{session.lock();bridge.webkit.messageHandlers.monokey.postMessage({type:"failure"});}}
bridge.MonoKeyCredentialProvider={
 configure(snapshot:CipherSnapshot,services:CredentialService[],identity?:string):void {run(()=>session.configure(snapshot,services,identity));},
 unlock(passphrase:string,recovery:boolean):void {run(()=>bridge.webkit.messageHandlers.monokey.postMessage({type:"choices",items:session.unlock(passphrase,recovery)}));},
 select(id:string):void {run(()=>bridge.webkit.messageHandlers.monokey.postMessage({type:"credential",...session.select(id)}));},
 generate(rules:string[]):void {run(()=>bridge.webkit.messageHandlers.monokey.postMessage({type:"generated",password:session.generate(rules)}));},
 save(username:string,password:string):void {run(()=>bridge.webkit.messageHandlers.monokey.postMessage({type:"saved",record:session.save(username,password)}));},
 lock():void {session.lock();},
};
window.addEventListener("pagehide",()=>session.lock());

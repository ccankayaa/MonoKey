import { useEffect, useState } from "react";
import { AppState, Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import type { NativeAutofillRequest } from "@monokey/contracts";
interface NativeAutofill {
 clearActionIntent():Promise<void>;
 copy(value:string):Promise<void>;
 pendingRequest():Promise<NativeAutofillRequest|null>;
 complete(id:string,packageName:string,certificate:string,username:string,password:string):Promise<void>;
 cancel():Promise<void>;
 enableSettings():Promise<void>;
 writeCiphertextSnapshot(value:string):Promise<void>;
 clearCiphertextSnapshot():Promise<void>;
}
export const nativeAutofill=requireOptionalNativeModule<NativeAutofill>("MonoKeyAutofill");
export const nativeAutofillReviewed=process.env.EXPO_PUBLIC_NATIVE_AUTOFILL_REVIEWED==="true";
export function useNativeAutofillRequest():NativeAutofillRequest|null {
 const [request,setRequest]=useState<NativeAutofillRequest|null>(null);
 useEffect(()=>{if(Platform.OS!=="android" || !nativeAutofill)return;let active=true;const update=()=>void nativeAutofill!.pendingRequest().then(value=>{if(active)setRequest(value);}).catch(()=>{if(active)setRequest(null);});update();const listener=AppState.addEventListener("change",state=>{if(state==="active")update();});const timer=setInterval(update,5000);return()=>{active=false;listener.remove();clearInterval(timer);};},[]);
 return request;
}

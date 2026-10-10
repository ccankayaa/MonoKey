import { TurboModuleRegistry, Platform } from "react-native";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "./firebase";
// Native package is never loaded in Expo Go, where its TurboModule is absent.
export const nativeGoogle = TurboModuleRegistry.get("RNGoogleSignin") ? require("@react-native-google-signin/google-signin") as typeof import("@react-native-google-signin/google-signin") : null;
const webClientId=process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId=process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
export const nativeGoogleReady = Boolean(nativeGoogle && webClientId?.endsWith(".apps.googleusercontent.com") && (Platform.OS!=="ios" || iosClientId?.endsWith(".apps.googleusercontent.com")));
export async function nativeGoogleCredential() {
 if(!nativeGoogleReady || !nativeGoogle)throw {code:"auth/configuration-not-found"};
 nativeGoogle.GoogleSignin.configure({webClientId,iosClientId,offlineAccess:false});
 await nativeGoogle.GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog:true});
 const response=await nativeGoogle.GoogleSignin.signIn();
 if(response.type!=="success")throw {code:"auth/popup-closed-by-user"};
 if(!response.data.idToken)throw {code:"auth/invalid-credential"};
 return GoogleAuthProvider.credential(response.data.idToken);
}

export async function signInWithNativeGoogle():Promise<void> { await signInWithCredential(auth,await nativeGoogleCredential()); }

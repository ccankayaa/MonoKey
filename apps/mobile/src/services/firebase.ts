import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, OAuthProvider, signInWithCredential } from "firebase/auth";
import { environment } from "./environment";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";

const app = getApps().length > 0 ? getApp() : initializeApp(environment.firebase);

// React Native uses Firebase in-memory persistence here. ID tokens are intentionally
// not copied into AsyncStorage or custom plaintext storage.
export const auth = getAuth(app);
if (environment.authEmulatorUrl) connectAuthEmulator(auth, environment.authEmulatorUrl);

export async function signInWithApple(): Promise<void> {
  const rawNonce = crypto.randomUUID().replaceAll("-", "");
  const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const response = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    nonce,
  });
  if (!response.identityToken) throw new Error("Apple did not return an identity token.");
  const credential = new OAuthProvider("apple.com").credential({ idToken: response.identityToken, rawNonce });
  await signInWithCredential(auth, credential);
}

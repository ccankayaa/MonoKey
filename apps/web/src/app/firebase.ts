import { getApp, getApps, initializeApp } from "firebase/app";
import { environment } from "./environment";
import {
  GoogleAuthProvider,
  OAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  connectAuthEmulator,
} from "firebase/auth";

const configuration = environment.firebase;

export const firebaseConfigured = Object.values(configuration).every(value => Boolean(value));
export const firebaseApp = firebaseConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(configuration))
  : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

if (auth) {
  if (environment.authEmulatorUrl) connectAuthEmulator(auth, environment.authEmulatorUrl);
  void setPersistence(auth, browserLocalPersistence);
}

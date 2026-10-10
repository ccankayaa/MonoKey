import type { ExpoConfig } from "expo/config";
import { parseEnvironment } from "@monokey/contracts";
const variant = process.env.EXPO_PUBLIC_APP_ENV;
if (variant !== "dev" && variant !== "test" && variant !== "prod") throw new Error("Set EXPO_PUBLIC_APP_ENV explicitly.");
// Validate public build inputs before producing an artifact; runtime validates again per platform.
parseEnvironment({ environment: variant, apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID, firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  authEmulatorUrl: process.env.EXPO_PUBLIC_AUTH_EMULATOR_URL, allowLan: process.env.EXPO_PUBLIC_ALLOW_LAN === "true" });
const config: ExpoConfig = {
  name: variant === "prod" ? "Mono Key" : `Mono Key (${variant})`, slug: "monokey", version: variant === "test" ? "0.1.1" : "0.1.0", userInterfaceStyle: "automatic",
  scheme: variant === "prod" ? "monokey" : `monokey-${variant}`,
  // Preserve registered IDs. Supply distinct registered test IDs before native distribution.
  ios: { supportsTablet: true, ...(variant === "test" ? {buildNumber:"3"} : {}), bundleIdentifier: process.env.MONOKEY_IOS_BUNDLE_ID || (variant === "test" ? "com.monokeyapp.mobile.test" : "com.vaultx.app"), usesAppleSignIn: process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === "true" },
  android: { ...(variant === "test" ? {versionCode:3} : {}), package: process.env.MONOKEY_ANDROID_PACKAGE || (variant === "test" ? "com.monokeyapp.mobile.test" : "com.vaultx.app"),
    intentFilters: variant === "test" ? [{action:"VIEW",autoVerify:true,data:[{scheme:"https",host:"icy-mud-054dd8e0f.4.azurestaticapps.net",pathPrefix:"/auth/"},{scheme:"https",host:"test.my.monokeyapp.com",pathPrefix:"/auth/"}],category:["BROWSABLE","DEFAULT"]}] : [] },
  plugins: ["expo-secure-store", "expo-sqlite", "./plugins/withMonoKeyAutofill.cjs", ...(process.env.EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN === "true" ? ["expo-apple-authentication"] : []), ...(process.env.MONOKEY_GOOGLE_IOS_URL_SCHEME ? [["@react-native-google-signin/google-signin", {iosUrlScheme: process.env.MONOKEY_GOOGLE_IOS_URL_SCHEME}] as [string, {iosUrlScheme: string}]] : [])],
};
export default config;

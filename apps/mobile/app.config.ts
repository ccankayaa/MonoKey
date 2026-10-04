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
  name: variant === "prod" ? "Mono Key" : `Mono Key (${variant})`, slug: "monokey", version: "0.1.0", userInterfaceStyle: "automatic",
  scheme: variant === "prod" ? "monokey" : `monokey-${variant}`,
  // Preserve registered IDs. Supply distinct registered test IDs before native distribution.
  ios: { supportsTablet: true, bundleIdentifier: process.env.MONOKEY_IOS_BUNDLE_ID || "com.vaultx.app", usesAppleSignIn: false },
  android: { package: process.env.MONOKEY_ANDROID_PACKAGE || "com.vaultx.app" },
  plugins: ["expo-secure-store", "expo-sqlite"],
};
export default config;

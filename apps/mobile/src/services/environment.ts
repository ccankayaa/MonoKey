import { Platform } from "react-native";
import { parseEnvironment } from "@monokey/contracts";
export const environment = parseEnvironment({
  environment: process.env.EXPO_PUBLIC_APP_ENV,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || (process.env.EXPO_PUBLIC_APP_ENV === "dev" ? Platform.OS === "android" ? "http://10.0.2.2:5089" : "http://localhost:5089" : undefined),
  firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  authEmulatorUrl: process.env.EXPO_PUBLIC_AUTH_EMULATOR_URL || (process.env.EXPO_PUBLIC_APP_ENV === "dev" ? Platform.OS === "android" ? "http://10.0.2.2:9099" : "http://localhost:9099" : undefined),
  allowLan: process.env.EXPO_PUBLIC_ALLOW_LAN === "true",
});

import { parseEnvironment } from "@monokey/contracts";
const local = import.meta.env.MODE === "development" || import.meta.env.MODE === "test";
export const environment = parseEnvironment({
  environment: local ? "dev" : import.meta.env.MODE === "staging" ? "test" : "prod",
  apiBaseUrl: local ? import.meta.env.VITE_DEV_API_BASE_URL : import.meta.env.VITE_API_BASE_URL,
  firebaseProjectId: local ? "demo-monokey" : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  firebaseApiKey: local ? undefined : import.meta.env.VITE_FIREBASE_API_KEY,
  firebaseAppId: local ? undefined : import.meta.env.VITE_FIREBASE_APP_ID,
  firebaseAuthDomain: local ? undefined : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  authEmulatorUrl: import.meta.env.VITE_AUTH_EMULATOR_URL,
  allowLan: import.meta.env.VITE_ALLOW_LAN === "true",
});

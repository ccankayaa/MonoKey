import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { parseEnvironment } from "@monokey/contracts";
import { loadEnv } from "vite";
import { resolve } from "node:path";

export default defineConfig(({mode}) => {
  const values = loadEnv(mode, import.meta.dirname, "VITE_"); const local = mode === "development" || mode === "test";
  const environment = parseEnvironment({ environment: local ? "dev" : mode === "staging" ? "test" : "prod", apiBaseUrl: local ? values.VITE_DEV_API_BASE_URL : values.VITE_API_BASE_URL, firebaseProjectId: local ? undefined : values.VITE_FIREBASE_PROJECT_ID, firebaseApiKey: local ? undefined : values.VITE_FIREBASE_API_KEY, firebaseAppId: local ? undefined : values.VITE_FIREBASE_APP_ID, firebaseAuthDomain: local ? undefined : values.VITE_FIREBASE_AUTH_DOMAIN, authEmulatorUrl: values.VITE_AUTH_EMULATOR_URL, allowLan: values.VITE_ALLOW_LAN === "true" });
  return {
  plugins: [react(), { name: "monokey-hosting-headers", generateBundle() {
    if (environment.environment === "prod") {
      const config = JSON.parse(readFileSync(resolve(import.meta.dirname, "public/staticwebapp.config.json"), "utf-8"));
      config.globalHeaders["Content-Security-Policy"] = config.globalHeaders["Content-Security-Policy"].replaceAll("https://monokey-e9ahh8hpfqdah7em.ukwest-01.azurewebsites.net", environment.apiBaseUrl).replaceAll("https://vaultx-1ee62.firebaseapp.com", `https://${environment.firebase.authDomain}`);
      this.emitFile({type: "asset", fileName: "staticwebapp.config.json", source: JSON.stringify(config,null,2)});
    }
  }}],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@monokey/contracts": resolve(import.meta.dirname, "../packages/contracts/src/index.ts"),
      "@monokey/crypto": resolve(import.meta.dirname, "../packages/crypto/src/index.ts"),
    },
  },
  build: {
    sourcemap: false,
    target: "es2022",
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
};
});

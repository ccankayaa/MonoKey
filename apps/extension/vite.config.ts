import { readdirSync, readFileSync as readAsset } from "node:fs";
import { parseEnvironment } from "@monokey/contracts";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({mode}) => {
  const values = loadEnv(mode, import.meta.dirname, "VITE_");
  const local = mode === "development" || mode === "test";
  const environment = parseEnvironment({ environment: local ? "dev" : mode === "staging" ? "test" : "prod", apiBaseUrl: local ? values.VITE_DEV_API_BASE_URL : values.VITE_API_BASE_URL,
    firebaseProjectId: local ? undefined : values.VITE_FIREBASE_PROJECT_ID, firebaseApiKey: local ? undefined : values.VITE_FIREBASE_API_KEY, firebaseAppId: local ? undefined : values.VITE_FIREBASE_APP_ID, firebaseAuthDomain: local ? undefined : values.VITE_FIREBASE_AUTH_DOMAIN, authEmulatorUrl: values.VITE_AUTH_EMULATOR_URL });
  return {
  plugins: [{ name: "monokey-local-brand-assets", configureServer(server) {
 server.middlewares.use((request,response,next)=>{
  const name=request.url?.match(/^\/brands\/([a-zA-Z0-9-]+\.svg)$/)?.[1];if(!name)return next();
  const directory=resolve(import.meta.dirname,"../packages/contracts/assets/brands");if(!readdirSync(directory).includes(name))return next();
  response.setHeader("Content-Type","image/svg+xml");response.end(readAsset(resolve(directory,name)));
 });
}, generateBundle() {
 const directory=resolve(import.meta.dirname,"../packages/contracts/assets/brands");
 for(const name of readdirSync(directory).filter(value=>value.endsWith(".svg"))) this.emitFile({type:"asset",fileName:`brands/${name}`,source:readAsset(resolve(directory,name))});
}}, { name: "monokey-manifest", generateBundle() {
    const manifest = { manifest_version: 3, name: local ? "Mono Key (dev)" : `Mono Key (${environment.environment})`, version: "0.1.0", description: "User-triggered exact-origin encrypted credential filling.",
      permissions: ["activeTab","scripting","storage","idle"], host_permissions: [`${environment.apiBaseUrl}/*`, "https://identitytoolkit.googleapis.com/*", "https://securetoken.googleapis.com/*", ...(environment.authEmulatorUrl ? [`${environment.authEmulatorUrl}/*`] : [])],
      action: {default_popup: "popup.html",default_title: "Mono Key"},background: {service_worker: "background.js",type: "module"},
      content_security_policy: {extension_pages: `script-src 'self'; object-src 'none'; base-uri 'none'; connect-src 'self' ${environment.apiBaseUrl} https://identitytoolkit.googleapis.com https://securetoken.googleapis.com ${environment.authEmulatorUrl ?? ""}`}};
    this.emitFile({type: "asset",fileName: "manifest.json",source: JSON.stringify(manifest,null,2)});
  }}],
  publicDir: false,
  resolve: {
    alias: {
      "@monokey/contracts": resolve(import.meta.dirname, "../packages/contracts/src/index.ts"),
      "@monokey/crypto": resolve(import.meta.dirname, "../packages/crypto/src/index.ts"),
    },
  },
  build: {
    target: "chrome120",
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, "popup.html"),
        background: resolve(import.meta.dirname, "src/background.ts"),
      },
      output: { entryFileNames: "[name].js" },
    },
  },
};
});

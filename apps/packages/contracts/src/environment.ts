export type ApplicationEnvironment = "dev" | "test" | "prod";
export interface PublicEnvironmentInput {
  environment?: string | undefined;
  apiBaseUrl?: string | undefined;
  firebaseProjectId?: string | undefined;
  firebaseApiKey?: string | undefined;
  firebaseAppId?: string | undefined;
  firebaseAuthDomain?: string | undefined;
  authEmulatorUrl?: string | undefined;
  allowLan?: boolean | undefined;
}
export interface PublicEnvironment {
  environment: ApplicationEnvironment;
  apiBaseUrl: string;
  firebase: { projectId: string; apiKey: string; appId: string; authDomain: string };
  authEmulatorUrl: string | null;
  cacheNamespace: string;
}
export function parseEnvironment(input: PublicEnvironmentInput): PublicEnvironment {
  const environment = input.environment;
  if (environment !== "dev" && environment !== "test" && environment !== "prod") throw new Error("Application environment must be explicitly dev, test or prod.");
  const local = environment === "dev";
  const apiBaseUrl = input.apiBaseUrl || (local ? "http://localhost:5089" : "");
  let api: URL;
  try { api = new URL(apiBaseUrl); } catch { throw new Error("API URL is missing or invalid."); }
  const localHost = /^(localhost|127\.0\.0\.1|\[::1\]|10\.0\.2\.2)$/.test(api.hostname);
  const privateLan = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(api.hostname);
  if (api.username || api.password || api.search || api.hash || api.pathname !== "/" ||
      local && (!localHost && !(input.allowLan && privateLan) || !(api.protocol === "http:" && api.port === "5089" || api.protocol === "https:" && api.port === "7244")) ||
      !local && (api.protocol !== "https:" || localHost || privateLan)) throw new Error("API URL violates the application environment boundary.");
  if (environment === "test" && api.origin !== "https://monokey-e9ahh8hpfqdah7em.ukwest-01.azurewebsites.net") throw new Error("Test API must use the existing Azure HTTPS hostname until custom domain readiness is verified.");
  if (environment === "prod" && api.origin !== "https://api.monokeyapp.com") throw new Error("Production API must use its configured production origin.");
  const projectId = input.firebaseProjectId || (local ? "demo-monokey" : "");
  if (local && projectId !== "demo-monokey" || environment === "test" && projectId !== "vaultx-1ee62" ||
      environment === "prod" && (!projectId || projectId === "vaultx-1ee62" || projectId.startsWith("demo-"))) throw new Error("Firebase project violates the application environment boundary.");
  const apiKey = input.firebaseApiKey || (local ? "demo-monokey-public-key" : "");
  const appId = input.firebaseAppId || (local ? "demo-monokey-local-app" : "");
  const authDomain = input.firebaseAuthDomain || (local ? "localhost" : "");
  if (!local && authDomain !== `${projectId}.firebaseapp.com`) throw new Error("Firebase auth domain must belong to the configured identity project.");
  if (!apiKey || !appId || !authDomain || [apiKey,appId,authDomain,projectId].some(value => /<|>|REPLACE|placeholder/i.test(value))) throw new Error("Firebase public client configuration is incomplete.");
  const authEmulatorUrl = local ? input.authEmulatorUrl || "http://localhost:9099" : null;
  if (!local && input.authEmulatorUrl) throw new Error("Remote builds cannot use the Auth Emulator.");
  if (authEmulatorUrl) {
    const emulator = new URL(authEmulatorUrl);
    if (emulator.hostname !== api.hostname || emulator.protocol !== "http:" || emulator.port !== "9099" || emulator.username || emulator.password || emulator.pathname !== "/" || emulator.search || emulator.hash) throw new Error("Auth Emulator must use the same explicit local host on port 9099.");
  }
  if (environment === "test" && authDomain !== "vaultx-1ee62.firebaseapp.com") throw new Error("Test Firebase auth domain does not match its project.");
  return { environment, apiBaseUrl: api.origin, firebase: { projectId, apiKey, appId, authDomain }, authEmulatorUrl,
    cacheNamespace: `monokey:${environment}:${projectId}:v2` };
}

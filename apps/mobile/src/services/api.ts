import { MonoKeyApiClient } from "@monokey/contracts";
import { auth } from "./firebase";
import { environment } from "./environment";

export const api = new MonoKeyApiClient(environment.apiBaseUrl, {
  async getIdToken(forceRefresh?: boolean) {
    const user = auth.currentUser; if (!user) return null; const token = await user.getIdToken(forceRefresh); return auth.currentUser?.uid === user.uid ? token : null;
  },
}, environment.environment === "dev");

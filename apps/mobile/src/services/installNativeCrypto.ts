import { getRandomValues, randomUUID } from "expo-crypto";

// Shared protocol v1 requires Web Crypto-shaped secure randomness on Hermes too.
// Use the installed native CSPRNG API; getRandomBytes has a debugger fallback.
export function installNativeCrypto(): void {
  const existing = globalThis.crypto;
  if (typeof existing?.getRandomValues === "function" && typeof existing.randomUUID === "function") return;
  if (typeof getRandomValues !== "function" || typeof randomUUID !== "function") {
    throw new Error("Native cryptographic randomness is unavailable.");
  }
  const provider = existing ?? {} as Crypto;
  if (typeof provider.getRandomValues !== "function") {
    Object.defineProperty(provider, "getRandomValues", {value: getRandomValues, configurable: true});
  }
  if (typeof provider.randomUUID !== "function") {
    Object.defineProperty(provider, "randomUUID", {value: randomUUID, configurable: true});
  }
  if (!existing) Object.defineProperty(globalThis, "crypto", {value: provider, configurable: true});
}

installNativeCrypto();

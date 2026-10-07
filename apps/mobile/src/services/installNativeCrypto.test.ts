import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();vi.resetModules();vi.doUnmock("expo-crypto");});

describe("native protocol randomness",()=>{
  it("uses the native CSPRNG when Hermes has no Web Crypto and never uses Math.random",async()=>{
    const native=vi.fn((bytes:Uint8Array)=>{bytes.fill(42);return bytes;});
    vi.stubGlobal("crypto",undefined);vi.spyOn(Math,"random").mockImplementation(()=>{throw new Error("Insecure randomness used");});
    vi.doMock("expo-crypto",()=>({getRandomValues:native,randomUUID:()=>"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}));
    await import("./installNativeCrypto");
    const bytes=new Uint8Array(32);expect(crypto.getRandomValues(bytes)).toBe(bytes);expect(native).toHaveBeenCalledWith(bytes);
    expect(crypto.randomUUID()).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  });
  it("fails closed if native randomness is unavailable",async()=>{
    vi.stubGlobal("crypto",undefined);vi.doMock("expo-crypto",()=>({getRandomValues:undefined,randomUUID:undefined}));
    await expect(import("./installNativeCrypto")).rejects.toThrow("Native cryptographic randomness is unavailable");
    expect(globalThis.crypto).toBeUndefined();
  });
  it("preserves an existing complete secure provider",async()=>{
    const provider=globalThis.crypto;vi.doMock("expo-crypto",()=>({getRandomValues:undefined,randomUUID:undefined}));
    await import("./installNativeCrypto");expect(globalThis.crypto).toBe(provider);
  });
});

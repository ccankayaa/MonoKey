import { describe, expect, it } from "vitest";
import type { VaultPlaintextRecord } from "@monokey/contracts";
import {
  rewrapMasterPassphrase,
  clearBytes,
  createVault,
  decryptVaultRecord,
  encryptVaultRecord,
  exactOriginMatches,
  unlockWithMasterPassphrase,
  unlockWithRecoveryCode,
} from "./index.js";

const userId = "firebase-user-123";
const passphrase = "correct horse battery staple";
const record: VaultPlaintextRecord = {
  schemaVersion: 1,
  kind: "login",
  title: "Example",
  username: "ada@example.test",
  password: "not-a-real-secret",
  url: "https://example.test/login",
  favorite: true,
  updatedAtUtc: "2026-09-28T00:00:00.000Z",
};

describe("vault cryptographic protocol", () => {
  it("interoperates through master and recovery wrappers", () => {
    const setup = createVault(passphrase, userId);
    const masterKey = unlockWithMasterPassphrase(passphrase, userId, setup.envelope);
    const recoveryKey = unlockWithRecoveryCode(setup.recoveryCode, userId, setup.envelope);
    expect(masterKey).toEqual(setup.vaultKey);
    expect(recoveryKey).toEqual(setup.vaultKey);
    clearBytes(masterKey);
    clearBytes(recoveryKey);
    clearBytes(setup.vaultKey);
  });

  it("encrypts every confidential field and fails closed for tampering or wrong record binding", () => {
    const setup = createVault(passphrase, userId);
    const encrypted = encryptVaultRecord(setup.vaultKey, userId, "0199f000-0000-7000-8000-000000000001", record);
    expect(JSON.stringify(encrypted)).not.toContain(record.title);
    expect(JSON.stringify(encrypted)).not.toContain(record.username);
    expect(decryptVaultRecord(setup.vaultKey, userId, encrypted)).toEqual(record);

    const tampered = { ...encrypted, ciphertext: `${encrypted.ciphertext.slice(0, -2)}AA` };
    expect(() => decryptVaultRecord(setup.vaultKey, userId, tampered)).toThrow();
    expect(() => decryptVaultRecord(setup.vaultKey, userId, { ...encrypted, id: "0199f000-0000-7000-8000-000000000002" })).toThrow();
    expect(() => decryptVaultRecord(new Uint8Array(32).fill(9), userId, encrypted)).toThrow();
    clearBytes(setup.vaultKey);
  });

  it("rewraps the same key while preserving existing ciphertext and recovery access", () => {
    const setup = createVault(passphrase, userId);
    const encrypted = encryptVaultRecord(setup.vaultKey, userId, "0199f000-0000-7000-8000-000000000001", record);
    const updated = rewrapMasterPassphrase(setup.vaultKey, "a different strong master passphrase", userId, { ...setup.envelope, revision: 3 });
    expect(updated.expectedRevision).toBe(3);
    const key = unlockWithMasterPassphrase("a different strong master passphrase", userId, updated);
    expect(decryptVaultRecord(key, userId, encrypted)).toEqual(record);
    const recovery = unlockWithRecoveryCode(setup.recoveryCode, userId, updated);
    expect(recovery).toEqual(key);
    expect(() => unlockWithMasterPassphrase(passphrase, userId, updated)).toThrow();
    clearBytes(key); clearBytes(recovery); clearBytes(setup.vaultKey);
  }, 20_000);

  it("matches only exact secure origins", () => {
    expect(exactOriginMatches("https://accounts.example.com/login", "https://accounts.example.com/settings")).toBe(true);
    expect(exactOriginMatches("https://example.com", "https://example.com.evil.test")).toBe(false);
    expect(exactOriginMatches("https://example.com", "http://example.com")).toBe(false);
  });

  it("matches the public protocol v1 cross-client vector", () => {
    const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    let nextByte = 0;
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: { getRandomValues<T extends ArrayBufferView | null>(value: T): T {
      if (!(value instanceof Uint8Array)) throw new Error("The vector expects Uint8Array randomness.");
      for (let index = 0; index < value.length; index += 1) value[index] = nextByte++ & 0xff;
      return value;
    } } });
    try {
      const setup = createVault(passphrase, userId);
      const encrypted = encryptVaultRecord(setup.vaultKey, userId, "0199f000-0000-7000-8000-000000000001", record);
      expect(setup.envelope.salt).toBe("AAECAwQFBgcICQoLDA0ODw==");
      expect(setup.envelope.masterWrappedKey).toBe("C2NTqZqOGyUTOVDAyspnT+WHFCMflJpsea3fg4VocS8DtGXkUFq8DE7F1cFJiau2");
      expect(setup.recoveryCode).toBe("MDEyMzQ1Njc4OTo7PD0-P0BBQkNERUZHSElKS0xNTk8");
      expect(encrypted.nonce).toBe("gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaX");
      expect(encrypted.ciphertext).toBe("rTCFKc7zknHo08xpO58zGaEs2hb49CpCgVPH5nZXRDpnVkECHOQ9cOWgzoHYd0Agwz92852LMh7/wcbeYo5nppZDr0XiCVlwdnZpJV4t9kNF7ejGk+GUEZRI8mSZIakyXNtV0YIEeaAbPCMIiUW3jjes4hXlJH81ioPymsktopFUmgK6CYCqlIn4h7813cr0kev5BDixYJUSBif5LSo/y+8S8Ieng+LbrSgzWFmqE7rNYr2mCt0DXtJ3gWxowOzFd4xF0sKVzl1DFrnOJ3lq0pQF3JGGb+jzawQbIJ0y");
    } finally {
      if (originalCrypto) Object.defineProperty(globalThis, "crypto", originalCrypto);
    }
  });
});

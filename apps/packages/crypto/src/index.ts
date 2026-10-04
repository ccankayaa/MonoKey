import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { argon2id } from "@noble/hashes/argon2.js";
import type { EncryptedVaultRecord, VaultKeyEnvelope, VaultPlaintextRecord } from "@monokey/contracts";

export const VAULT_FORMAT_VERSION = 1 as const;
interface KdfParameters { memoryKiB: number; iterations: number; parallelism: number }
export const KDF_PARAMETERS: Readonly<KdfParameters> = Object.freeze({ memoryKiB: 65_536, iterations: 3, parallelism: 1 });

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

export interface NewVaultMaterial {
  envelope: VaultKeyEnvelope;
  vaultKey: Uint8Array;
  recoveryCode: string;
}

export function createVault(masterPassphrase: string, userId: string): NewVaultMaterial {
  requirePassphrase(masterPassphrase);
  const salt = randomBytes(16);
  const vaultKey = randomBytes(32);
  const recoveryKey = randomBytes(32);
  const masterKey = deriveMasterKey(masterPassphrase, salt, KDF_PARAMETERS);
  const masterWrapNonce = randomBytes(24);
  const recoveryWrapNonce = randomBytes(24);
  const masterWrappedKey = seal(masterKey, masterWrapNonce, vaultKey, keyWrapAad(userId, "master"));
  const recoveryWrappedKey = seal(recoveryKey, recoveryWrapNonce, vaultKey, keyWrapAad(userId, "recovery"));

  masterKey.fill(0);
  return {
    envelope: {
      formatVersion: VAULT_FORMAT_VERSION,
      kdfAlgorithm: "argon2id",
      kdfMemoryKiB: KDF_PARAMETERS.memoryKiB,
      kdfIterations: KDF_PARAMETERS.iterations,
      kdfParallelism: KDF_PARAMETERS.parallelism,
      salt: toBase64(salt),
      encryptionAlgorithm: "xchacha20-poly1305",
      masterWrapNonce: toBase64(masterWrapNonce),
      masterWrappedKey: toBase64(masterWrappedKey),
      recoveryWrapNonce: toBase64(recoveryWrapNonce),
      recoveryWrappedKey: toBase64(recoveryWrappedKey),
      expectedRevision: null,
    },
    vaultKey,
    recoveryCode: toBase64Url(recoveryKey),
  };
}

export function unlockWithMasterPassphrase(
  masterPassphrase: string,
  userId: string,
  envelope: VaultKeyEnvelope,
): Uint8Array {
  validateEnvelope(envelope);
  const masterKey = deriveMasterKey(masterPassphrase, fromBase64(envelope.salt), {
    memoryKiB: envelope.kdfMemoryKiB,
    iterations: envelope.kdfIterations,
    parallelism: envelope.kdfParallelism,
  });
  try {
    return open(
      masterKey,
      fromBase64(envelope.masterWrapNonce),
      fromBase64(envelope.masterWrappedKey),
      keyWrapAad(userId, "master"),
    );
  } finally {
    masterKey.fill(0);
  }
}

export function unlockWithRecoveryCode(
  recoveryCode: string,
  userId: string,
  envelope: VaultKeyEnvelope,
): Uint8Array {
  validateEnvelope(envelope);
  const recoveryKey = fromBase64Url(recoveryCode);
  if (recoveryKey.length !== 32) throw new Error("Recovery code is invalid.");
  try {
    return open(
      recoveryKey,
      fromBase64(envelope.recoveryWrapNonce),
      fromBase64(envelope.recoveryWrappedKey),
      keyWrapAad(userId, "recovery"),
    );
  } finally {
    recoveryKey.fill(0);
  }
}

export function rewrapMasterPassphrase(
  vaultKey: Uint8Array,
  newMasterPassphrase: string,
  userId: string,
  currentEnvelope: VaultKeyEnvelope,
): VaultKeyEnvelope {
  requireKey(vaultKey);
  requirePassphrase(newMasterPassphrase);
  if (currentEnvelope.revision === undefined) throw new Error("The current envelope revision is required.");
  const salt = randomBytes(16);
  const nonce = randomBytes(24);
  const masterKey = deriveMasterKey(newMasterPassphrase, salt, KDF_PARAMETERS);
  try {
    return {
      ...currentEnvelope,
      kdfMemoryKiB: KDF_PARAMETERS.memoryKiB,
      kdfIterations: KDF_PARAMETERS.iterations,
      kdfParallelism: KDF_PARAMETERS.parallelism,
      salt: toBase64(salt),
      masterWrapNonce: toBase64(nonce),
      masterWrappedKey: toBase64(seal(masterKey, nonce, vaultKey, keyWrapAad(userId, "master"))),
      expectedRevision: currentEnvelope.revision,
    };
  } finally {
    masterKey.fill(0);
  }
}

export function encryptVaultRecord(
  vaultKey: Uint8Array,
  userId: string,
  id: string,
  record: VaultPlaintextRecord,
): EncryptedVaultRecord {
  requireKey(vaultKey);
  const nonce = randomBytes(24);
  const plaintext = encoder.encode(JSON.stringify(record));
  try {
    return {
      id,
      formatVersion: VAULT_FORMAT_VERSION,
      encryptionAlgorithm: "xchacha20-poly1305",
      nonce: toBase64(nonce),
      ciphertext: toBase64(seal(vaultKey, nonce, plaintext, recordAad(userId, id))),
    };
  } finally {
    plaintext.fill(0);
  }
}

export function decryptVaultRecord(
  vaultKey: Uint8Array,
  userId: string,
  encrypted: EncryptedVaultRecord,
): VaultPlaintextRecord {
  requireKey(vaultKey);
  if (encrypted.formatVersion !== VAULT_FORMAT_VERSION || encrypted.encryptionAlgorithm !== "xchacha20-poly1305") {
    throw new Error("Vault record format is unsupported.");
  }
  const plaintext = open(
    vaultKey,
    fromBase64(encrypted.nonce),
    fromBase64(encrypted.ciphertext),
    recordAad(userId, encrypted.id),
  );
  try {
    const parsed = JSON.parse(decoder.decode(plaintext)) as unknown;
    if (!isVaultRecord(parsed)) throw new Error("Decrypted vault record schema is invalid.");
    return parsed;
  } finally {
    plaintext.fill(0);
  }
}

export function generatePassword(length = 20): string {
  if (!Number.isInteger(length) || length < 16 || length > 128) throw new Error("Password length must be 16 through 128.");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=";
  const rejectionLimit = 256 - (256 % alphabet.length);
  let result = "";
  while (result.length < length) {
    for (const value of randomBytes(length)) {
      if (value < rejectionLimit && result.length < length) result += alphabet[value % alphabet.length];
    }
  }
  return result;
}

export function exactOriginMatches(savedUrl: string, pageUrl: string): boolean {
  try {
    const saved = new URL(savedUrl);
    const page = new URL(pageUrl);
    return saved.protocol === "https:" && page.protocol === "https:" && saved.origin === page.origin;
  } catch {
    return false;
  }
}

export function clearBytes(value: Uint8Array | null | undefined): void {
  value?.fill(0);
}

function deriveMasterKey(passphrase: string, salt: Uint8Array, parameters: KdfParameters): Uint8Array {
  requirePassphrase(passphrase);
  if (salt.length !== 16) throw new Error("Vault salt is invalid.");
  const passwordBytes = encoder.encode(passphrase.normalize("NFKC"));
  try {
    return argon2id(passwordBytes, salt, {
      m: parameters.memoryKiB,
      t: parameters.iterations,
      p: parameters.parallelism,
      dkLen: 32,
    });
  } finally {
    passwordBytes.fill(0);
  }
}

function seal(key: Uint8Array, nonce: Uint8Array, plaintext: Uint8Array, aad: Uint8Array): Uint8Array {
  return xchacha20poly1305(key, nonce, aad).encrypt(plaintext);
}

function open(key: Uint8Array, nonce: Uint8Array, ciphertext: Uint8Array, aad: Uint8Array): Uint8Array {
  return xchacha20poly1305(key, nonce, aad).decrypt(ciphertext);
}

function keyWrapAad(userId: string, purpose: "master" | "recovery"): Uint8Array {
  return encoder.encode(`vaultx|key-wrap|v1|${userId}|${purpose}`);
}

function recordAad(userId: string, recordId: string): Uint8Array {
  return encoder.encode(`vaultx|record|v1|${userId}|${recordId.toLowerCase()}`);
}

function randomBytes(length: number): Uint8Array {
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

function requireKey(key: Uint8Array): void {
  if (key.length !== 32) throw new Error("Vault key is invalid.");
}

function requirePassphrase(value: string): void {
  if (value.normalize("NFKC").length < 12) throw new Error("Master passphrase must contain at least 12 characters.");
}

function validateEnvelope(envelope: VaultKeyEnvelope): void {
  if (envelope.formatVersion !== 1 || envelope.kdfAlgorithm !== "argon2id" || envelope.encryptionAlgorithm !== "xchacha20-poly1305") {
    throw new Error("Vault key envelope format is unsupported.");
  }
}

function isVaultRecord(value: unknown): value is VaultPlaintextRecord {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<VaultPlaintextRecord>;
  return candidate.schemaVersion === 1
    && (candidate.kind === "login" || candidate.kind === "secureNote")
    && typeof candidate.title === "string"
    && typeof candidate.favorite === "boolean"
    && typeof candidate.updatedAtUtc === "string";
}

function toBase64(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function toBase64Url(value: Uint8Array): string {
  return toBase64(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  return fromBase64(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
}

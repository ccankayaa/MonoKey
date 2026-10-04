import { describe, expect, it } from "vitest";
import type { EncryptedVaultRecord } from "@monokey/contracts";
import { mergeEncryptedRecords } from "./syncPolicy";

const base: EncryptedVaultRecord = { id: "record-1", formatVersion: 1, encryptionAlgorithm: "xchacha20-poly1305", nonce: "nonce", ciphertext: "ciphertext" };

describe("offline encrypted sync policy", () => {
  it("keeps the highest server revision and propagates tombstones", () => {
    const cached = [{ ...base, revision: 2 }];
    const remote = [{ ...base, revision: 3, nonce: "", ciphertext: "", isDeleted: true }];
    expect(mergeEncryptedRecords(cached, remote)).toEqual(remote);
  });
});

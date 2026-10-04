import { afterEach, describe, expect, it, vi } from "vitest";
import { MonoKeyApiClient, type EncryptedVaultRecord } from "./index.js";

afterEach(() => vi.unstubAllGlobals());

describe("MonoKey API client security", () => {
  it("rejects cleartext remote API origins", () => {
    expect(() => new MonoKeyApiClient("http://api.example.test", { getIdToken: async () => "token" })).toThrow(/HTTPS/);
  });

  it("sends an authenticated ciphertext-only vault record payload", async () => {
    const record: EncryptedVaultRecord = { id: "0199f000-0000-7000-8000-000000000001", formatVersion: 1, encryptionAlgorithm: "xchacha20-poly1305", nonce: "bm9uY2U=", ciphertext: "Y2lwaGVydGV4dA==" };
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => new Response(JSON.stringify({ ...record, revision: 1 }), { status: 201, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const client = new MonoKeyApiClient("https://api.example.test", { getIdToken: async () => "firebase-id-token" });
    await client.createVaultRecord(record);
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.headers).toMatchObject({ Authorization: "Bearer firebase-id-token" });
    expect(init?.body).toBe(JSON.stringify(record));
    expect(String(init?.body)).not.toContain("password");
    expect(String(init?.body)).not.toContain("username");
  });
});

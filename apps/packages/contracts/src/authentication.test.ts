import { describe, expect, it } from "vitest";
import { authenticationMessage, normalizeLoginEmail, mayUnlinkProvider, safeAuthCode } from "./authentication.js";
describe("shared account authentication policy", () => {
  it("validates email strings before Firebase calls", () => {
    expect(normalizeLoginEmail("  Person@example.test  ")).toBe("Person@example.test");
    for (const value of [null, {}, "", "invalid", "a b@example.test"]) expect(() => normalizeLoginEmail(value)).toThrow();
  });
  it("keeps diagnostics safe and account existence ambiguous", () => {
    expect(safeAuthCode({ code: "email@example.test" })).toBe("auth/unknown");
    expect(authenticationMessage({code:"auth/user-not-found"},"tr")).toBe(authenticationMessage({code:"auth/wrong-password"},"tr"));
    expect(authenticationMessage({code:"auth/email-already-in-use"},"en")).toBe(authenticationMessage({code:"auth/invalid-credential"},"en"));
  });
  it("preserves the last usable verified provider", () => {
    expect(mayUnlinkProvider(["google.com"], "google.com", true)).toBe(false);
    expect(mayUnlinkProvider(["google.com","password"], "google.com", false)).toBe(false);
    expect(mayUnlinkProvider(["google.com","password"], "password", false)).toBe(true);
  });
});

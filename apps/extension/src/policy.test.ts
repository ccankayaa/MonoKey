import { describe, expect, it } from "vitest";
import { canFill } from "./policy";

describe("autofill policy", () => {
  it("allows a user-selected record only for the exact HTTPS origin in the top frame", () => {
    expect(canFill("https://accounts.example.test/login", "https://accounts.example.test/settings", 0)).toBe(true);
    expect(canFill("https://example.test", "https://example.test.evil.invalid", 0)).toBe(false);
    expect(canFill("https://example.test", "https://example.test", 2)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import type { SubscriptionInput } from "@monokey/contracts";
import { isValidSubscriptionInput } from "./SubscriptionsPage";

const valid: SubscriptionInput = { name: "Service", amount: 12.5, currencyCode: "TRY", billingIntervalUnit: "Month", billingIntervalCount: 1, nextRenewalDate: "2026-10-01" };

describe("subscription form validation", () => {
  it("accepts a complete non-negative subscription and rejects invalid drafts", () => {
    expect(isValidSubscriptionInput(valid)).toBe(true);
    expect(isValidSubscriptionInput({ ...valid, name: "  " })).toBe(false);
    expect(isValidSubscriptionInput({ ...valid, amount: -0.01 })).toBe(false);
    expect(isValidSubscriptionInput({ ...valid, currencyCode: "TL" })).toBe(false);
    expect(isValidSubscriptionInput({ ...valid, nextRenewalDate: "" })).toBe(false);
  });
});

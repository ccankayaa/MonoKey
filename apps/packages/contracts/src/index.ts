export { parseEnvironment, type PublicEnvironment, type PublicEnvironmentInput, type ApplicationEnvironment } from "./environment.js";
export type BillingIntervalUnit = "Day" | "Week" | "Month" | "Year";
export type SubscriptionStatus = "Active" | "Paused" | "Cancelled";

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface Subscription {
  id: string;
  name: string;
  providerPlanLabel?: string | null;
  category?: string | null;
  paymentMethodLabel?: string | null;
  clientRequestId?: string;
  amount: number;
  currencyCode: string;
  billingIntervalCode: number;
  billingIntervalUnit: BillingIntervalUnit;
  billingIntervalCount: number;
  nextRenewalDate: string;
  status: SubscriptionStatus;
  concurrencyToken: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SubscriptionInput {
  name: string;
  providerPlanLabel?: string | null;
  category?: string | null;
  paymentMethodLabel?: string | null;
  clientRequestId?: string;
  amount: number;
  currencyCode: string;
  billingIntervalUnit: BillingIntervalUnit;
  billingIntervalCount: number;
  nextRenewalDate: string;
  status?: SubscriptionStatus;
}

export interface CostSummary {
  currencyCode: string;
  monthlyCost: number;
  yearlyCost: number;
}

export interface NotificationPreferenceInput {
  renewalRemindersEnabled: boolean;
  daysBeforeRenewal: number;
}

export interface NotificationPreference extends NotificationPreferenceInput {
  id: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface VaultKeyEnvelope {
  formatVersion: 1;
  kdfAlgorithm: "argon2id";
  kdfMemoryKiB: number;
  kdfIterations: number;
  kdfParallelism: number;
  salt: string;
  encryptionAlgorithm: "xchacha20-poly1305";
  masterWrapNonce: string;
  masterWrappedKey: string;
  recoveryWrapNonce: string;
  recoveryWrappedKey: string;
  expectedRevision?: number | null;
  revision?: number;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface EncryptedVaultRecord {
  id: string;
  formatVersion: 1;
  encryptionAlgorithm: "xchacha20-poly1305";
  nonce: string;
  ciphertext: string;
  revision?: number;
  expectedRevision?: number;
  isDeleted?: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export type VaultRecordKind = "login" | "secureNote";

export interface VaultPlaintextRecord {
  schemaVersion: 1;
  kind: VaultRecordKind;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  favorite: boolean;
  folder?: string;
  updatedAtUtc: string;
  nativeAutofill?: { android?: {packageName: string; certificateSha256: string} };
}

export interface ProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  public constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails,
  ) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${status}.`);
    this.name = "ApiError";
  }
}

export interface TokenProvider {
  getIdToken(forceRefresh?: boolean): Promise<string | null>;
}

export class MonoKeyApiClient {
  private readonly baseUrl: string;

  public constructor(baseUrl: string, private readonly tokenProvider: TokenProvider, allowLocalNetwork = false) {
    const normalized = baseUrl.replace(/\/$/, "");
    if (!normalized.startsWith("https://") && !/^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?$/.test(normalized) && !allowLocalNetwork) {
      throw new Error("MonoKey API must use HTTPS outside localhost development.");
    }

    this.baseUrl = normalized;
  }

  public listSubscriptions(signal?: AbortSignal): Promise<PagedResult<Subscription>> {
    return this.allPages<Subscription>("/api/subscriptions", 100, signal);
  }

  public getCostSummary(signal?: AbortSignal): Promise<CostSummary[]> {
    return this.request("/api/subscriptions/cost-summary", { signal });
  }

  public getUpcoming(days = 30, signal?: AbortSignal): Promise<Subscription[]> {
    return this.request(`/api/subscriptions/upcoming?days=${days}`, { signal });
  }

  public createSubscription(input: SubscriptionInput, signal?: AbortSignal): Promise<Subscription> {
    return this.request("/api/subscriptions", { method: "POST", body: input, signal });
  }

  public updateSubscription(subscription: Subscription, input: SubscriptionInput, signal?: AbortSignal): Promise<Subscription> {
    return this.request(`/api/subscriptions/${subscription.id}`, {
      method: "PUT",
      body: { ...input, status: input.status ?? subscription.status, concurrencyToken: subscription.concurrencyToken },
      signal,
    });
  }

  public deleteSubscription(subscription: Subscription, signal?: AbortSignal): Promise<void> {
    return this.request(`/api/subscriptions/${subscription.id}?concurrencyToken=${encodeURIComponent(subscription.concurrencyToken)}`, {
      method: "DELETE",
      signal,
    });
  }

  public getMembership(signal?: AbortSignal): Promise<Membership> { return this.request("/api/membership", { signal }); }
  public getPlans(signal?: AbortSignal): Promise<Plan[]> { return this.request("/api/membership/plans", { signal }); }
  public createCheckout(signal?: AbortSignal): Promise<{url: string}> { return this.request("/api/membership/checkout", { method: "POST", signal }); }
  public async getProfile(signal?: AbortSignal): Promise<{displayName: string | null}> { return await this.request<{displayName: string | null} | undefined>("/api/profile", { signal }) ?? {displayName: null}; }
  public updateProfile(displayName: string, signal?: AbortSignal): Promise<{displayName: string | null}> { return this.request("/api/profile", {method: "PUT", body: {displayName}, signal}); }
  public async getNotificationPreference(signal?: AbortSignal): Promise<NotificationPreference | null> {
    return await this.request<NotificationPreference | undefined>("/api/notification-preferences", {signal}) ?? null;
  }
  public updateNotificationPreference(input: NotificationPreferenceInput, signal?: AbortSignal): Promise<NotificationPreference> {
    return this.request("/api/notification-preferences", {method: "PUT", body: {renewalRemindersEnabled: input.renewalRemindersEnabled, daysBeforeRenewal: input.daysBeforeRenewal}, signal});
  }
  public listVaultLinks(subscriptionId: string, signal?: AbortSignal): Promise<Array<{vaultRecordId: string}>> { return this.request(`/api/subscriptions/${subscriptionId}/vault-links`, { signal }); }
  public linkVaultRecord(subscription: Subscription, record: EncryptedVaultRecord, signal?: AbortSignal): Promise<void> {
    return this.request(`/api/subscriptions/${subscription.id}/vault-links/${record.id}`, { method: "PUT", body: {subscriptionConcurrencyToken: subscription.concurrencyToken, recordRevision: record.revision}, signal });
  }
  public unlinkVaultRecord(subscription: Subscription, recordId: string, signal?: AbortSignal): Promise<void> {
    return this.request(`/api/subscriptions/${subscription.id}/vault-links/${recordId}?concurrencyToken=${encodeURIComponent(subscription.concurrencyToken)}`, { method: "DELETE", signal });
  }
  public getVaultKeyEnvelope(signal?: AbortSignal): Promise<VaultKeyEnvelope> {
    return this.request("/api/vault/key-envelope", { signal });
  }

  public putVaultKeyEnvelope(envelope: VaultKeyEnvelope, signal?: AbortSignal): Promise<VaultKeyEnvelope> {
    return this.request("/api/vault/key-envelope", { method: "PUT", body: envelope, signal });
  }

  public listVaultRecords(signal?: AbortSignal): Promise<PagedResult<EncryptedVaultRecord>> {
    return this.allPages<EncryptedVaultRecord>("/api/vault/records", 500, signal);
  }

  public createVaultRecord(record: EncryptedVaultRecord, signal?: AbortSignal): Promise<EncryptedVaultRecord> {
    return this.request("/api/vault/records", { method: "POST", body: record, signal });
  }

  public updateVaultRecord(record: EncryptedVaultRecord, signal?: AbortSignal): Promise<EncryptedVaultRecord> {
    return this.request(`/api/vault/records/${record.id}`, { method: "PUT", body: record, signal });
  }

  public deleteVaultRecord(id: string, expectedRevision: number, signal?: AbortSignal): Promise<EncryptedVaultRecord> {
    return this.request(`/api/vault/records/${id}?expectedRevision=${expectedRevision}`, { method: "DELETE", signal });
  }

  private async allPages<T>(path: string, size: number, signal?: AbortSignal): Promise<PagedResult<T>> {
    const token = await this.tokenProvider.getIdToken(); if (!token) throw new ApiError(401, {status: 401, title: "Authentication required"});
    const items: T[] = []; let page = 1; let totalCount = 0;
    do {
      const result = await this.request<PagedResult<T>>(`${path}?page=${page}&pageSize=${size}`, { signal, token });
      items.push(...result.items); totalCount = result.totalCount;
      if (result.items.length < size) break;
      page++;
    } while (items.length < totalCount);
    return { items, page: 1, pageSize: items.length, totalCount };
  }

  private async request<T>(
    path: string,
    options: { method?: string; body?: unknown; token?: string; signal?: AbortSignal | undefined } = {},
  ): Promise<T> {
    const token = options.token ?? await this.tokenProvider.getIdToken();
    if (!token) {
      throw new ApiError(401, { title: "Authentication required", status: 401 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const abortFromCaller = (): void => controller.abort();
    options.signal?.addEventListener("abort", abortFromCaller, { once: true });
    if (options.signal?.aborted) controller.abort();

    try {
      const requestInit: RequestInit = {
        method: options.method ?? "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        signal: controller.signal,
      };
      if (options.body !== undefined) requestInit.body = JSON.stringify(options.body);
      const response = await fetch(`${this.baseUrl}${path}`, requestInit);

      if (!response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        const problem = contentType.includes("application/problem+json")
          ? (await response.json()) as ProblemDetails
          : { status: response.status, title: "Request failed" };
        throw new ApiError(response.status, problem);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json() as T;
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener("abort", abortFromCaller);
    }
  }
}

export interface Membership { plan: "Free" | "Pro"; status: string; validUntilUtc: string | null; checkoutAvailable: boolean }
export interface Plan { id: string; displayPrice: string | null; subscriptionLimit: number | null; vaultRecordLimit: number | null }
export * from "./authentication.js";
export * from "./brandCatalog.js";
export * from "./nativeAutofill.js";
export * from "./emailAction.js";

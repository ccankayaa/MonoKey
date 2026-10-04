import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiError, MonoKeyApiClient, type Subscription, type SubscriptionInput } from "@monokey/contracts";
import { auth } from "./firebase";
import { environment } from "./environment";

const apiBaseUrl = environment.apiBaseUrl;
export const apiClient = new MonoKeyApiClient(apiBaseUrl, {
  async getIdToken(forceRefresh?: boolean) {
    const user = auth?.currentUser; if (!user) return null; const token = await user.getIdToken(forceRefresh); return auth?.currentUser?.uid === user.uid ? token : null;
  },
}, environment.environment === "dev");

function normalizeError(error: unknown): { status: number | string; data: unknown } {
  if (error instanceof ApiError) return { status: error.status, data: error.problem };
  if (error instanceof Error) return { status: "CLIENT_ERROR", data: { title: error.message } };
  return { status: "UNKNOWN", data: { title: "Unknown error" } };
}

export const monoKeyApi = createApi({
  reducerPath: "monoKeyApi",
  baseQuery: fakeBaseQuery<{ status: number | string; data: unknown }>(),
  tagTypes: ["Subscriptions", "Summary", "Membership", "Profile", "VaultLinks"],
  endpoints: builder => ({
    vaultLinks: builder.query<Array<{vaultRecordId: string}>, string>({
      async queryFn(id, queryApi) {try {return {data: await apiClient.listVaultLinks(id,queryApi.signal)};} catch(error){return {error:normalizeError(error)};}},
      providesTags: ["VaultLinks"],
    }),
    membership: builder.query({
      async queryFn(_argument, queryApi) { try { return { data: await apiClient.getMembership(queryApi.signal) }; } catch (error) { return { error: normalizeError(error) }; } },
      providesTags: ["Membership"],
    }),
    plans: builder.query({
      async queryFn(_argument, queryApi) { try { return { data: await apiClient.getPlans(queryApi.signal) }; } catch (error) { return { error: normalizeError(error) }; } },
    }),
    profile: builder.query({
      async queryFn(_argument, queryApi) { try { return { data: await apiClient.getProfile(queryApi.signal) }; } catch (error) { return { error: normalizeError(error) }; } },
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<{displayName: string | null}, string>({
      async queryFn(name, queryApi) { try { return { data: await apiClient.updateProfile(name, queryApi.signal) }; } catch (error) { return { error: normalizeError(error) }; } },
      invalidatesTags: ["Profile"],
    }),
    updateSubscription: builder.mutation<Subscription, {subscription: Subscription; input: SubscriptionInput}>({
      async queryFn({subscription, input}, queryApi) { try { return { data: await apiClient.updateSubscription(subscription, input, queryApi.signal) }; } catch (error) { return { error: normalizeError(error) }; } },
      invalidatesTags: ["Subscriptions", "Summary"],
    }),
    subscriptions: builder.query({
      async queryFn(_argument, queryApi) {
        try { return { data: await apiClient.listSubscriptions(queryApi.signal) }; }
        catch (error) { return { error: normalizeError(error) }; }
      },
      providesTags: ["Subscriptions"],
    }),
    costSummary: builder.query({
      async queryFn(_argument, queryApi) {
        try { return { data: await apiClient.getCostSummary(queryApi.signal) }; }
        catch (error) { return { error: normalizeError(error) }; }
      },
      providesTags: ["Summary"],
    }),
    upcoming: builder.query({
      async queryFn(days: number, queryApi) {
        try { return { data: await apiClient.getUpcoming(days, queryApi.signal) }; }
        catch (error) { return { error: normalizeError(error) }; }
      },
      providesTags: ["Subscriptions"],
    }),
    createSubscription: builder.mutation<Subscription, SubscriptionInput>({
      async queryFn(input, queryApi) {
        try { return { data: await apiClient.createSubscription(input, queryApi.signal) }; }
        catch (error) { return { error: normalizeError(error) }; }
      },
      invalidatesTags: ["Subscriptions", "Summary"],
    }),
    deleteSubscription: builder.mutation<void, Subscription>({
      async queryFn(subscription, queryApi) {
        try { return { data: await apiClient.deleteSubscription(subscription, queryApi.signal) }; }
        catch (error) { return { error: normalizeError(error) }; }
      },
      invalidatesTags: ["Subscriptions", "Summary"],
    }),
  }),
});

export const {
  useVaultLinksQuery,
  useMembershipQuery,
  usePlansQuery,
  useProfileQuery,
  useUpdateProfileMutation,
  useUpdateSubscriptionMutation,
  useSubscriptionsQuery,
  useCostSummaryQuery,
  useUpcomingQuery,
  useCreateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = monoKeyApi;

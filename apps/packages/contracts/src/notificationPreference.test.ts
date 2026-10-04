import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, MonoKeyApiClient } from "./index.js";

const client = new MonoKeyApiClient("http://localhost:5089", {getIdToken: async()=>"synthetic-test-token"}, true);
afterEach(()=>vi.unstubAllGlobals());

describe("notification preferences",()=>{
  it("returns absence without writing a fabricated persisted preference",async()=>{
    const request=vi.fn().mockResolvedValue(new Response(null,{status:204}));vi.stubGlobal("fetch",request);
    expect(await client.getNotificationPreference()).toBeNull();expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[1].method).toBe("GET");
  });
  it("does not replace an authorization failure with defaults",async()=>{
    vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response(null,{status:401})));
    await expect(client.getNotificationPreference()).rejects.toBeInstanceOf(ApiError);
  });
});

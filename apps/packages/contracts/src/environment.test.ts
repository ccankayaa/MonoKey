import { describe, expect, it } from "vitest";
import { parseEnvironment } from "./environment.js";
describe("environment boundaries", () => {
  it("uses local emulator and isolates caches from the real test project", () => {
    const dev = parseEnvironment({ environment: "dev" });
    expect(dev.firebase.projectId).toBe("demo-monokey"); expect(dev.authEmulatorUrl).toBe("http://localhost:9099");
    expect(() => parseEnvironment({ environment: "dev", firebaseProjectId: "vaultx-1ee62" })).toThrow();
  });
  it("requires explicit remote configuration and rejects cross routing", () => {
    expect(() => parseEnvironment({ environment: "prod" })).toThrow();
    expect(() => parseEnvironment({ environment: "test", apiBaseUrl: "http://localhost:5089" })).toThrow();
    expect(() => parseEnvironment({ environment: "prod", apiBaseUrl: "https://api.monokeyapp.com", firebaseProjectId: "vaultx-1ee62" })).toThrow();
  });
  it("permits Android emulator addressing and only explicitly enabled private LAN", () => {
    expect(parseEnvironment({ environment: "dev", apiBaseUrl: "http://10.0.2.2:5089", authEmulatorUrl: "http://10.0.2.2:9099" }).apiBaseUrl).toContain("10.0.2.2");
    expect(() => parseEnvironment({ environment: "dev", apiBaseUrl: "http://192.168.1.10:5089" })).toThrow();
    expect(parseEnvironment({ environment: "dev", apiBaseUrl: "http://192.168.1.10:5089", authEmulatorUrl: "http://192.168.1.10:9099", allowLan: true }).environment).toBe("dev");
  });
});

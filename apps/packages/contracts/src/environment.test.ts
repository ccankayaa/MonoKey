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

it("rejects example Firebase public settings and mismatched TEST app project numbers",()=>{
 const base={environment:"test",apiBaseUrl:"https://monokey-e9ahh8hpfqdah7em.ukwest-01.azurewebsites.net",firebaseProjectId:"vaultx-1ee62",firebaseAuthDomain:"vaultx-1ee62.firebaseapp.com",firebaseApiKey:"AIza"+"A".repeat(35),firebaseAppId:"1:1054617929710:web:abcdef"};
 expect(()=>parseEnvironment({...base,firebaseApiKey:"example-api-key"})).toThrow("example values");
 expect(()=>parseEnvironment({...base,firebaseAppId:"1:111111111:web:abcdef"})).toThrow("different project number");
});

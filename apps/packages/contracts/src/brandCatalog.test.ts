import { describe, expect, it } from "vitest";
import { brandCatalog, findBrand, searchBrands } from "./brandCatalog.js";
describe("shared brand catalog",()=>{
 it("keeps stable unique IDs, source domains and local assets",()=>{expect(brandCatalog.length).toBeGreaterThanOrEqual(54);expect(new Set(brandCatalog.map(b=>b.id)).size).toBe(brandCatalog.length);for(const b of brandCatalog){expect(b.domains.every(d=>/^[a-z0-9.-]+$/.test(d))).toBe(true);expect(b.domainSource).toMatch(/^https:\/\//);if(b.asset)expect(b.asset).toMatch(/^[a-zA-Z0-9-]+\.svg$/);}});
 it("finds corrected aliases and Turkish names without substring misidentification",()=>{expect(findBrand("Exen")?.id).toBe("exxen");expect(searchBrands("e nabiz").some(x=>x.id==="enabiz")).toBe(true);expect(findBrand("not-netflix.example")?.id).toBeUndefined();expect(searchBrands("", "banking").length).toBeGreaterThanOrEqual(10);});
});

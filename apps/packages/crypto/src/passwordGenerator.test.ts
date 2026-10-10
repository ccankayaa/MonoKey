import { describe, expect, it, vi } from "vitest";
import { encryptVaultRecord,decryptVaultRecord,generatePassword, passwordEntropyUpperBound } from "./index.js";
describe("secure password generator",()=>{
 it("uses 20 characters and includes every enabled class",()=>{ for(let i=0;i<40;i++){ const p=generatePassword(); expect(p).toHaveLength(20);expect(p).toMatch(/[A-Z]/);expect(p).toMatch(/[a-z]/);expect(p).toMatch(/[2-9]/);expect(p).toMatch(/[!@#$%^&*_=+?-]/);expect(p).not.toMatch(/[Il1O0o]/); } });
 it("respects character classes and configurable length",()=>{const p=generatePassword({length:64,uppercase:false,lowercase:false,symbols:false,excludeAmbiguous:false});expect(p).toMatch(/^\d{64}$/);expect(passwordEntropyUpperBound({length:20,uppercase:false,lowercase:false,symbols:false,excludeAmbiguous:false})).toBeCloseTo(20*Math.log2(10));});
 it("rejects invalid length and empty classes",()=>{expect(()=>generatePassword(15)).toThrow();expect(()=>generatePassword({uppercase:false,lowercase:false,digits:false,symbols:false})).toThrow();});
 it("rejects out-of-range random bytes instead of modulo bias",()=>{ let calls=0;const spy=vi.spyOn(crypto,"getRandomValues").mockImplementation(array=>{calls++;if(calls===1){(array as Uint8Array).fill(255);return array;}(array as Uint8Array).fill(2);return array;});try{expect(generatePassword({uppercase:false,lowercase:false,symbols:false,excludeAmbiguous:false})).toBe("2".repeat(20));expect(calls).toBe(40);}finally{spy.mockRestore();} });
 it("fails closed if platform randomness fails",()=>{const spy=vi.spyOn(crypto,"getRandomValues").mockImplementation(()=>{throw Error("unavailable");});try{expect(()=>generatePassword()).toThrow("unavailable");}finally{spy.mockRestore();}});
});

it('keeps native app bindings only inside the existing v1 encrypted record',()=>{
 const key=crypto.getRandomValues(new Uint8Array(32));const binding={android:{packageName:'com.example.private',certificateSha256:'A'.repeat(64)}};
 const input={schemaVersion:1 as const,kind:'login' as const,title:'Synthetic',favorite:false,updatedAtUtc:'2026-10-10T00:00:00Z',nativeAutofill:binding};
 const record=encryptVaultRecord(key,'synthetic-owner','12345678-1234-1234-1234-123456789012',input);expect(JSON.stringify(record)).not.toContain('com.example.private');expect(decryptVaultRecord(key,'synthetic-owner',record).nativeAutofill).toEqual(binding);expect(()=>decryptVaultRecord(key,'other-owner',record)).toThrow();key.fill(0);
});

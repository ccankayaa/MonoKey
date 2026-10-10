import {describe,it,expect} from 'vitest';
import {matchesNativeApplication,matchesCredentialService} from './nativeAutofill.js';
import type {VaultPlaintextRecord} from './index.js';
const certificate='A'.repeat(64),request={id:'ephemeral',packageName:'com.example.app',certificateSha256:certificate};
const record:VaultPlaintextRecord={schemaVersion:1,kind:'login',title:'Synthetic',username:'synthetic',password:'not-persisted',favorite:false,updatedAtUtc:'2026-10-10T00:00:00Z',nativeAutofill:{android:{packageName:request.packageName,certificateSha256:certificate}}};
describe('native application autofill trust boundary',()=>{
 it('matches only an explicitly bound package and certificate',()=>{expect(matchesNativeApplication(record,request)).toBe(true);expect(matchesNativeApplication(record,{...request,packageName:'com.example.app.evil'})).toBe(false);expect(matchesNativeApplication(record,{...request,certificateSha256:'B'.repeat(64)})).toBe(false);});
 it('rejects missing bindings and malformed certificates',()=>{expect(matchesNativeApplication({...record,nativeAutofill:{}},request)).toBe(false);expect(matchesNativeApplication({...record,nativeAutofill:{android:{packageName:request.packageName,certificateSha256:'A'}}},request)).toBe(false);});
});

it('requires exact HTTPS origin including port and rejects lookalikes and userinfo',()=>{
 expect(matchesCredentialService('https://example.com/login',{type:'domain',identifier:'example.com'})).toBe(true);
 expect(matchesCredentialService('https://evil.example.com/login',{type:'domain',identifier:'example.com'})).toBe(false);
 expect(matchesCredentialService('http://example.com/login',{type:'domain',identifier:'example.com'})).toBe(false);
 expect(matchesCredentialService('https://example.com:444/login',{type:'domain',identifier:'example.com'})).toBe(false);
 expect(matchesCredentialService('https://user@example.com/login',{type:'domain',identifier:'example.com'})).toBe(false);
 expect(matchesCredentialService('https://example.com:444/login',{type:'url',identifier:'https://example.com/login'})).toBe(false);
});

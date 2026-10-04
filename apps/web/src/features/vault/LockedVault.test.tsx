import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VaultSessionProvider, useVaultSession } from "./VaultSession";
const key = new Uint8Array(32);
function Probe() {
 const session = useVaultSession();
 return <><button onClick={() => {key.fill(9); session.setVaultKey(key);session.setRecords([{encrypted:{id:"synthetic",formatVersion:1,encryptionAlgorithm:"xchacha20-poly1305",nonce:"",ciphertext:""},plaintext:{schemaVersion:1,kind:"login",title:"Synthetic private title",password:"synthetic-password",favorite:true,updatedAtUtc:"2030-01-01T00:00:00Z"}}]);}}>Unlock fixture</button><button onClick={session.lock}>Lock</button>{session.records.map(item => <p key={item.encrypted.id}>{item.plaintext.title}</p>)}</>;
}
describe("actual vault session cleanup", () => {
 it("clears decrypted records and key bytes when explicitly locked", () => {
  render(<VaultSessionProvider><Probe /></VaultSessionProvider>); fireEvent.click(screen.getByText("Unlock fixture")); expect(screen.getByText("Synthetic private title")).toBeInTheDocument(); fireEvent.click(screen.getByText("Lock")); expect(screen.queryByText("Synthetic private title")).not.toBeInTheDocument(); expect(key.every(value => value === 0)).toBe(true);
 });
 it("clears decrypted records on background and key bytes on account unmount", () => {
  const view=render(<VaultSessionProvider><Probe /></VaultSessionProvider>); fireEvent.click(screen.getByText("Unlock fixture")); const visibility=vi.spyOn(document,"visibilityState","get").mockReturnValue("hidden"); fireEvent(document,new Event("visibilitychange")); expect(screen.queryByText("Synthetic private title")).not.toBeInTheDocument(); visibility.mockRestore(); fireEvent.click(screen.getByText("Unlock fixture")); view.unmount(); expect(key.every(value => value === 0)).toBe(true);
 });
});

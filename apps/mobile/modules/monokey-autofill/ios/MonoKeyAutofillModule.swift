import ExpoModulesCore
import UIKit\nimport AuthenticationServices

public class MonoKeyAutofillModule: Module {
  private func snapshotURL() throws -> URL {
    guard let group = Bundle.main.object(forInfoDictionaryKey: "MonoKeyAutofillGroup") as? String,
      let root = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: group) else { throw NSError(domain:"MonoKeyAutofill",code:1) }
    return root.appendingPathComponent("vault-v1.json")
  }
  public func definition() -> ModuleDefinition {
    Name("MonoKeyAutofill")
    AsyncFunction("setActiveAccount") { (uid:String?) in try SharedVaultStore.setActiveUser(uid) }
    AsyncFunction("pendingSavedRecords") { () -> [[String:Any]] in try SharedVaultStore.pending() }
    AsyncFunction("acknowledgeSavedRecord") { (id:String) in try SharedVaultStore.changePending { records in records.filter {$0["id"] as? String != id} } }
    AsyncFunction("registerCredentialIdentities") { (payload:String) in
      guard let data=payload.data(using:.utf8),data.count<=500_000,
        let items=try JSONSerialization.jsonObject(with:data) as? [[String:String]],items.count<=500,
        let uid=SharedVaultStore.activeUser() else {throw SharedVaultStore.failure()}
      let snapshot=try SharedVaultStore.snapshot()
      let ids=Set((snapshot["records"] as? [[String:Any]] ?? []).compactMap {$0["id"] as? String})
      let prefix=SharedVaultStore.namespace+"|"+uid+"|"
      var identities:[ASPasswordCredentialIdentity]=[]
      for item in items {
        guard Set(item.keys)==Set(["origin","username","id"]),let origin=item["origin"],let url=URL(string:origin),
          url.scheme=="https",url.user==nil,url.password==nil,url.host != nil,let username=item["username"],username.utf8.count<=512,
          let id=item["id"],ids.contains(id) else {throw SharedVaultStore.failure()}
        identities.append(ASPasswordCredentialIdentity(serviceIdentifier:ASCredentialServiceIdentifier(identifier:origin,type:.URL),user:username,recordIdentifier:prefix+id))
      }
      ASCredentialIdentityStore.shared.getState { state in
        if state.isEnabled && SharedVaultStore.activeUser()==uid {ASCredentialIdentityStore.shared.replaceCredentialIdentities(with:identities,completion:nil)}
      }
    }
    AsyncFunction("clearActionIntent") { }
    AsyncFunction("copy") { (value: String) in
      DispatchQueue.main.async { UIPasteboard.general.setItems([["public.utf8-plain-text":value]], options:[.localOnly:true,.expirationDate:Date().addingTimeInterval(30)]) }
    }
    AsyncFunction("writeCiphertextSnapshot") { (payload: String) in
      guard let data=payload.data(using:.utf8), data.count <= 20_000_000,
        let object=try JSONSerialization.jsonObject(with:data) as? [String:Any],
        Set(object.keys)==Set(["version","namespace","uid","envelope","records"]),
        object["version"] as? Int == 1,
        object["namespace"] as? String == Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillNamespace") as? String,
        let uid=object["uid"] as? String, !uid.isEmpty,
        let envelope=object["envelope"] as? [String:Any],
        envelope["formatVersion"] as? Int == 1,
        envelope["encryptionAlgorithm"] as? String == "xchacha20-poly1305",
        let records=object["records"] as? [[String:Any]] else { throw NSError(domain:"MonoKeyAutofill",code:2) }
      let envelopeFields=Set(["formatVersion","kdfAlgorithm","kdfMemoryKiB","kdfIterations","kdfParallelism","salt","encryptionAlgorithm","masterWrapNonce","masterWrappedKey","recoveryWrapNonce","recoveryWrappedKey","expectedRevision","revision","createdAtUtc","updatedAtUtc"])
      let recordFields=Set(["id","formatVersion","encryptionAlgorithm","nonce","ciphertext","revision","expectedRevision","isDeleted","createdAtUtc","updatedAtUtc"])
      guard Set(envelope.keys).isSubset(of:envelopeFields), records.allSatisfy({ Set($0.keys).isSubset(of:recordFields) && $0["formatVersion"] as? Int == 1 && $0["encryptionAlgorithm"] as? String == "xchacha20-poly1305" }) else { throw NSError(domain:"MonoKeyAutofill",code:3) }
      guard uid==SharedVaultStore.activeUser(),records.count<=5000 else {throw SharedVaultStore.failure()}\n      try data.write(to:self.snapshotURL(), options:[.atomic,.completeFileProtection])
    }
    AsyncFunction("clearCiphertextSnapshot") { () -> Void in
      try SharedVaultStore.setActiveUser(nil)
    }
    AsyncFunction("pendingRequest") { () -> String? in return nil }
  }
}

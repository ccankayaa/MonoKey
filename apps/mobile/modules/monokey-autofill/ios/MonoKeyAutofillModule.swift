import ExpoModulesCore
import UIKit

public class MonoKeyAutofillModule: Module {
  private func snapshotURL() throws -> URL {
    guard let group = Bundle.main.object(forInfoDictionaryKey: "MonoKeyAutofillGroup") as? String,
      let root = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: group) else { throw NSError(domain:"MonoKeyAutofill",code:1) }
    return root.appendingPathComponent("vault-v1.json")
  }
  public func definition() -> ModuleDefinition {
    Name("MonoKeyAutofill")
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
      try data.write(to:self.snapshotURL(), options:[.atomic,.completeFileProtection])
    }
    AsyncFunction("clearCiphertextSnapshot") { () -> Void in
      if let url=try? self.snapshotURL() { try? FileManager.default.removeItem(at:url) }
    }
    AsyncFunction("pendingRequest") { () -> String? in return nil }
  }
}

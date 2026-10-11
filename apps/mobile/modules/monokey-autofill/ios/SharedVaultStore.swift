import Foundation
import Security
import AuthenticationServices

enum SharedVaultStore {
  static var namespace: String { Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillNamespace") as? String ?? "" }
  static func root() throws -> URL {
    guard let group=Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillGroup") as? String,
      let root=FileManager.default.containerURL(forSecurityApplicationGroupIdentifier:group) else {throw failure()}
    return root
  }
  static func failure() -> NSError { NSError(domain:"MonoKeyAutofill",code:1) }
  static func activeUser() -> String? {
    guard let group=Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillKeychainGroup") as? String else {return nil}
    let query:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:"MonoKey.Autofill.Account",kSecAttrAccount as String:namespace,kSecAttrAccessGroup as String:group,kSecReturnData as String:true,kSecMatchLimit as String:kSecMatchLimitOne]
    var result:CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary,&result)==errSecSuccess,let data=result as? Data else{return nil}
    return String(data:data,encoding:.utf8)
  }
  static func setActiveUser(_ uid:String?) throws {
    guard let group=Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillKeychainGroup") as? String else {throw failure()}
    if activeUser() != uid {try clear()}
    let query:[String:Any]=[kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:"MonoKey.Autofill.Account",kSecAttrAccount as String:namespace,kSecAttrAccessGroup as String:group]
    SecItemDelete(query as CFDictionary)
    if let uid {
      guard !uid.isEmpty,uid.utf8.count<=128 else {throw failure()}
      var value=query;value[kSecValueData as String]=Data(uid.utf8);value[kSecAttrAccessible as String]=kSecAttrAccessibleWhenUnlockedThisDeviceOnly
      guard SecItemAdd(value as CFDictionary,nil)==errSecSuccess else {throw failure()}
    }
  }
  static func snapshot() throws -> [String:Any] {
    let data=try Data(contentsOf:root().appendingPathComponent("vault-v1.json"))
    guard data.count<=20_000_000,let object=try JSONSerialization.jsonObject(with:data) as? [String:Any],
      object["version"] as? Int==1,object["namespace"] as? String==namespace,
      let uid=object["uid"] as? String,uid==activeUser() else {throw failure()}
    return object
  }
  static func pending() throws -> [[String:Any]] {
    let file=try root().appendingPathComponent("pending-v1.json")
    guard let data=try? Data(contentsOf:file) else {return []}
    guard data.count<=2_000_000,let queue=try JSONSerialization.jsonObject(with:data) as? [String:Any],
      queue["namespace"] as? String==namespace,queue["uid"] as? String==activeUser(),
      let records=queue["records"] as? [[String:Any]],records.count<=100 else {throw failure()}
    return records
  }
  static func changePending(_ change:([[String:Any]])throws->[[String:Any]]) throws {
    let file=try root().appendingPathComponent("pending-v1.json")
    var coordinationError:NSError?,operationError:Error?
    NSFileCoordinator(filePresenter:nil).coordinate(writingItemAt:file,options:.forMerging,error:&coordinationError){url in
      do {
        guard let uid=activeUser() else {throw failure()}
        let records=try change(pending());guard records.count<=100 else{throw failure()}
        let data=try JSONSerialization.data(withJSONObject:["version":1,"namespace":namespace,"uid":uid,"records":records])
        guard data.count<=2_000_000 else{throw failure()}
        try data.write(to:url,options:[.atomic,.completeFileProtection])
      } catch {operationError=error}
    }
    if let error=coordinationError {throw error};if let error=operationError{throw error}
  }
  static func append(_ record:[String:Any],expectedUser:String) throws {
    let fields=Set(["id","formatVersion","encryptionAlgorithm","nonce","ciphertext"])
    guard Set(record.keys).isSubset(of:fields),let id=record["id"] as? String,UUID(uuidString:id) != nil,
      record["formatVersion"] as? Int==1,record["encryptionAlgorithm"] as? String=="xchacha20-poly1305",
      record["nonce"] is String,record["ciphertext"] is String else{throw failure()}
    try changePending { records in
      guard activeUser()==expectedUser else{throw failure()}
      return records.contains(where:{$0["id"] as? String==id}) ? records : records+[record]
    }
  }
  static func clear() throws {
    let directory=try root()
    for name in ["vault-v1.json","pending-v1.json"] {try? FileManager.default.removeItem(at:directory.appendingPathComponent(name))}
    ASCredentialIdentityStore.shared.removeAllCredentialIdentities(nil)
  }
}

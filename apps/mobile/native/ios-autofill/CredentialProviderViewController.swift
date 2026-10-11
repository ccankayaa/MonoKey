import AuthenticationServices
import WebKit
import UIKit

final class CredentialProviderViewController: ASCredentialProviderViewController, WKScriptMessageHandler, WKNavigationDelegate {
  private var browser:WKWebView!
  private var services:[ASCredentialServiceIdentifier]=[]
  private var identity:String?
  private var configuredUser:String?
  private var generationRules:[String]?
  private var saveCredential:ASPasswordCredential?
  private let stack=UIStackView(),password=UITextField(),status=UILabel()
  private var buttons:[UIButton]=[]
  private var timer:Timer?
  private var unlocked=false,chosen=false,recovery=false,finished=false,bridgeReady=false
  private var locale:String {Locale.current.language.languageCode?.identifier=="tr" ? "tr":"en"}
  private func text(_ tr:String,_ en:String)->String {locale=="tr" ? tr:en}

  override func viewDidLoad() {
    super.viewDidLoad();view.backgroundColor = .systemBackground
    let scroll=UIScrollView();scroll.translatesAutoresizingMaskIntoConstraints=false;view.addSubview(scroll)
    stack.axis = .vertical;stack.spacing=16;stack.translatesAutoresizingMaskIntoConstraints=false;scroll.addSubview(stack)
    NSLayoutConstraint.activate([scroll.leadingAnchor.constraint(equalTo:view.safeAreaLayoutGuide.leadingAnchor),scroll.trailingAnchor.constraint(equalTo:view.safeAreaLayoutGuide.trailingAnchor),scroll.topAnchor.constraint(equalTo:view.safeAreaLayoutGuide.topAnchor),scroll.bottomAnchor.constraint(equalTo:view.safeAreaLayoutGuide.bottomAnchor),stack.leadingAnchor.constraint(equalTo:scroll.contentLayoutGuide.leadingAnchor,constant:24),stack.trailingAnchor.constraint(equalTo:scroll.contentLayoutGuide.trailingAnchor,constant:-24),stack.topAnchor.constraint(equalTo:scroll.contentLayoutGuide.topAnchor,constant:24),stack.bottomAnchor.constraint(equalTo:scroll.contentLayoutGuide.bottomAnchor,constant:-24),stack.widthAnchor.constraint(equalTo:scroll.frameLayoutGuide.widthAnchor,constant:-48)])
    let title=UILabel();title.text="Mono Key";title.font = .preferredFont(forTextStyle:.title1);stack.addArrangedSubview(title)
    status.numberOfLines=0;stack.addArrangedSubview(status)
    password.isSecureTextEntry=true;password.textContentType = .password;password.borderStyle = .roundedRect;password.placeholder=text("Kasa ana parolası","Vault master passphrase");stack.addArrangedSubview(password)
    addButton(text("Ana parola / Kurtarma kodu","Master passphrase / Recovery code")){[weak self] in self?.toggleRecovery()}
    addButton(text("Kasayı aç","Unlock vault")){[weak self] in self?.unlockVault()}
    addButton(text("Vazgeç","Cancel")){[weak self] in self?.cancelRequest()}
    let config=WKWebViewConfiguration();config.websiteDataStore = .nonPersistent();config.userContentController.add(self,name:"monokey")
    browser=WKWebView(frame:.zero,configuration:config);browser.navigationDelegate=self;browser.isHidden=true;view.addSubview(browser)
    guard let html=Bundle.main.url(forResource:"bridge",withExtension:"html") else{fail();return}
    browser.loadFileURL(html,allowingReadAccessTo:html.deletingLastPathComponent())
    timer=Timer.scheduledTimer(withTimeInterval:120,repeats:false){[weak self]_ in self?.cancelRequest()}
    NotificationCenter.default.addObserver(self,selector:#selector(background),name:UIApplication.didEnterBackgroundNotification,object:nil)
  }
  private func addButton(_ title:String,choice:Bool=false,action:@escaping()->Void) {
    let button=UIButton(type:.system);button.setTitle(title,for:.normal);button.titleLabel?.numberOfLines=0
    button.addAction(UIAction{_ in action()},for:.touchUpInside);stack.addArrangedSubview(button);if choice{buttons.append(button)}
  }
  private func request(_ requested:[ASCredentialServiceIdentifier],identity:String?=nil) {
    services=requested;self.identity=identity;loadViewIfNeeded();if bridgeReady{configureBridge()}
  }
  override func prepareCredentialList(for serviceIdentifiers:[ASCredentialServiceIdentifier]) {request(serviceIdentifiers)}
  override func prepareInterfaceToProvideCredential(for credentialIdentity:ASPasswordCredentialIdentity) {request([credentialIdentity.serviceIdentifier],identity:credentialIdentity.recordIdentifier)}
  override func provideCredentialWithoutUserInteraction(for credentialIdentity:ASPasswordCredentialIdentity) {needInteraction()}
  @available(iOS 17.0,*)
  override func prepareInterfaceToProvideCredential(for credentialRequest:any ASCredentialRequest) {
    guard let selected=credentialRequest.credentialIdentity as? ASPasswordCredentialIdentity else{cancelRequest();return}
    request([selected.serviceIdentifier],identity:selected.recordIdentifier)
  }
  @available(iOS 17.0,*)
  override func provideCredentialWithoutUserInteraction(for credentialRequest:any ASCredentialRequest) {needInteraction()}
  @available(iOS 26.2,*)
  override func performWithoutUserInteraction(generatePasswordsRequest:ASGeneratePasswordsRequest) {needInteraction()}
  @available(iOS 26.2,*)
  override func prepareInterface(for generatePasswordsRequest:ASGeneratePasswordsRequest) {
    generationRules=[generatePasswordsRequest.passwordFieldPasswordRules,generatePasswordsRequest.confirmPasswordFieldPasswordRules,generatePasswordsRequest.passwordRulesFromQuirks].compactMap{$0}
    request([generatePasswordsRequest.serviceIdentifier])
  }
  @available(iOS 26.2,*)
  override func performWithoutUserInteractionIfPossible(savePasswordRequest:ASSavePasswordRequest) {needInteraction()}
  @available(iOS 26.2,*)
  override func prepareInterface(for savePasswordRequest:ASSavePasswordRequest) {
    saveCredential=savePasswordRequest.credential;request([savePasswordRequest.serviceIdentifier])
  }
  override func prepareInterfaceForExtensionConfiguration() {
    loadViewIfNeeded();password.isEnabled=false
    status.text=text("Önce uygulamada kasayı eşitleyin. Sistem önerileri, sağlayıcı seçiliyken sonraki kasa açılışında yenilenir. Her doldurmada ana parola veya kurtarma kodu gerekir.","Sync the vault in the app first. OS suggestions refresh on the next vault unlock after selecting this provider. Every fill requires a master passphrase or recovery code.")
    addButton(text("Tamam","Done")){[weak self] in self?.finished=true;self?.wipe();self?.extensionContext.completeExtensionConfigurationRequest()}
  }
  private func needInteraction(){extensionContext.cancelRequest(withError:NSError(domain:ASExtensionErrorDomain,code:ASExtensionError.userInteractionRequired.rawValue))}
  func webView(_ webView:WKWebView,decidePolicyFor navigationAction:WKNavigationAction,decisionHandler:@escaping(WKNavigationActionPolicy)->Void){decisionHandler(navigationAction.request.url?.isFileURL==true ? .allow:.cancel)}
  func webView(_ webView:WKWebView,didFinish navigation:WKNavigation!){bridgeReady=true;configureBridge()}
  private func configureBridge(){
    guard !finished,!services.isEmpty else{return}
    let reviewed=Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillReviewed") as? Bool==true
    let deviceTest=Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillDeviceTest") as? Bool==true
    guard reviewed || deviceTest else{status.text=text("İmzalı cihaz testi kurulumu bekleniyor.","Signed device test setup pending.");password.isEnabled=false;return}
    do{
      var snapshot=try SharedVaultStore.snapshot();configuredUser=snapshot["uid"] as? String;var records=snapshot["records"] as? [[String:Any]] ?? []
      records+=try SharedVaultStore.pending();snapshot["records"]=records
      let requested=services.map{["identifier":$0.identifier,"type":$0.type == .URL ? "url":"domain"]}
      call("configure",[snapshot,requested,identity.map { $0 as Any } ?? NSNull()])
      status.text=text("Kasa kilidini açın; yalnızca istenen HTTPS kaynağına ait kayıtlar gösterilir.","Unlock the vault; only records for the requested HTTPS service are offered.")
    }catch{status.text=text("Önce Mono Key uygulamasında kasayı açıp eşitleyin.","Unlock and sync your vault in Mono Key first.");password.isEnabled=false}
  }
  private func call(_ method:String,_ arguments:[Any]){
    guard !finished,let data=try? JSONSerialization.data(withJSONObject:arguments),let json=String(data:data,encoding:.utf8)else{return}
    browser.evaluateJavaScript("MonoKeyCredentialProvider."+method+"(..."+json+")"){[weak self]_,error in if error != nil{self?.fail()}}
  }
  private func toggleRecovery(){recovery.toggle();password.text="";password.placeholder=recovery ? text("Kurtarma kodu","Recovery code"):text("Kasa ana parolası","Vault master passphrase")}
  private func unlockVault(){guard password.isEnabled,let value=password.text,!value.isEmpty else{return};password.text="";password.resignFirstResponder();call("unlock",[value,recovery])}
  func userContentController(_ userContentController:WKUserContentController,didReceive message:WKScriptMessage){
    guard !finished,message.frameInfo.isMainFrame,message.webView===browser,let body=message.body as? [String:Any],let type=body["type"] as? String else{return}
    guard let configuredUser,SharedVaultStore.activeUser()==configuredUser else{cancelRequest();return}
    if type=="choices",let choices=body["items"] as? [[String:String]] {
      unlocked=true;buttons.forEach{$0.removeFromSuperview()};buttons=[]
      if let rules=generationRules{
        status.text=text("Bu kaynak için yeni parola üretilecek; kaydetme ayrıca onay ister.","Generate for this service; saving requires a separate confirmation.")
        addButton(text("Parola üret ve kullan","Generate and use"),choice:true){[weak self] in guard let self,self.unlocked else{return};self.chosen=true;self.call("generate",[rules])}
      }else if let credential=saveCredential{
        status.text=text("Yeni kayıt şifrelenerek yerelde saklanır; uygulama açıldığında eşitlenir. Mevcut kayıtların üzerine yazılmaz.","A new encrypted record is saved locally and synced by the app. Existing records are never overwritten.")
        addButton(text("Şifreli yeni kayıt olarak kaydet","Save as a new encrypted record"),choice:true){[weak self] in guard let self,self.unlocked else{return};self.chosen=true;self.call("save",[credential.user,credential.password])}
      }else{
        status.text=choices.isEmpty ? text("Bu kaynak için eşleşen kayıt yok.","No matching record for this service."):text("Doldurulacak kaydı seçin.","Choose a credential to fill.")
        for choice in choices.prefix(50){guard let id=choice["id"],let title=choice["title"] else{continue};let username=choice["username"] ?? ""
          addButton(title+" · "+username,choice:true){[weak self] in guard let self,self.unlocked else{return};self.chosen=true;self.call("select",[id])}
        }
      }
    }else if type=="credential",unlocked,chosen,let username=body["username"] as? String,let secret=body["password"] as? String {
      finished=true;wipe();extensionContext.completeRequest(withSelectedCredential:ASPasswordCredential(user:username,password:secret),completionHandler:nil)
    }else if type=="generated",unlocked,chosen,let secret=body["password"] as? String,generationRules != nil {
      if #available(iOS 26.2,*){finished=true;wipe();extensionContext.completeGeneratePasswordRequest(results:[ASGeneratedPassword(kind:secret.rangeOfCharacter(from:CharacterSet.alphanumerics.inverted)==nil ? .alphanumeric:.strong,value:secret)],completionHandler:nil)}else{cancelRequest()}
    }else if type=="saved",unlocked,chosen,saveCredential != nil,let record=body["record"] as? [String:Any] {
      do{_ = try SharedVaultStore.snapshot();try SharedVaultStore.append(record,expectedUser:configuredUser);if #available(iOS 26.2,*){finished=true;wipe();extensionContext.completeSavePasswordRequest(completionHandler:nil)}else{cancelRequest()}}catch{fail()}
    }else if type=="failure"{fail()}
  }
  private func fail(){unlocked=false;chosen=false;buttons.forEach{$0.removeFromSuperview()};buttons=[];status.text=text("İşlem yapılamadı. Ana parola, kaynak veya parola kuralları desteklenmiyor; uygulamadan devam edin.","Unable to continue. Check the passphrase, service or supported password rules; use the app for unsupported flows.")}
  private func wipe(){unlocked=false;chosen=false;password.text="";saveCredential=nil;generationRules=nil;buttons.forEach{$0.removeFromSuperview()};buttons=[];timer?.invalidate();browser?.evaluateJavaScript("MonoKeyCredentialProvider.lock()",completionHandler:nil)}
  @objc private func background(){cancelRequest()}
  private func cancelRequest(){guard !finished else{return};finished=true;wipe();extensionContext.cancelRequest(withError:NSError(domain:ASExtensionErrorDomain,code:ASExtensionError.userCanceled.rawValue))}
  deinit{timer?.invalidate();NotificationCenter.default.removeObserver(self)}
}

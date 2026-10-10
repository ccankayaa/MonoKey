import AuthenticationServices
import WebKit
import UIKit

final class CredentialProviderViewController: ASCredentialProviderViewController, WKScriptMessageHandler, WKNavigationDelegate {
  private var browser: WKWebView!
  private var services: [ASCredentialServiceIdentifier] = []
  private let stack=UIStackView()
  private let password=UITextField()
  private let status=UILabel()
  private var buttons:[UIButton]=[]
  private var timer:Timer?
  private var unlocked=false
  private var chosen=false
  private var recovery=false
  private var locale:String { Locale.current.language.languageCode?.identifier == "tr" ? "tr" : "en" }
  private func text(_ tr:String,_ en:String)->String { locale == "tr" ? tr : en }
  override func viewDidLoad() {
    super.viewDidLoad(); view.backgroundColor = .systemBackground
    stack.axis = .vertical; stack.spacing=16; stack.translatesAutoresizingMaskIntoConstraints=false;view.addSubview(stack)
    NSLayoutConstraint.activate([stack.leadingAnchor.constraint(equalTo:view.safeAreaLayoutGuide.leadingAnchor,constant:24),stack.trailingAnchor.constraint(equalTo:view.safeAreaLayoutGuide.trailingAnchor,constant:-24),stack.topAnchor.constraint(equalTo:view.safeAreaLayoutGuide.topAnchor,constant:24)])
    let title=UILabel();title.text="Mono Key";title.font = .preferredFont(forTextStyle:.title1);stack.addArrangedSubview(title)
    status.numberOfLines=0;stack.addArrangedSubview(status)
    password.isSecureTextEntry=true;password.textContentType = .password;password.borderStyle = .roundedRect;password.placeholder=text("Kasa ana parolası","Vault master passphrase");stack.addArrangedSubview(password)
    let mode=UIButton(type:.system);mode.setTitle(text("Ana parola / Kurtarma kodu","Master passphrase / Recovery code"),for:.normal);mode.addTarget(self,action:#selector(toggleRecovery),for:.touchUpInside);stack.addArrangedSubview(mode)
    let unlock=UIButton(type:.system);unlock.setTitle(text("Kasayı aç","Unlock vault"),for:.normal);unlock.addTarget(self,action:#selector(unlockVault),for:.touchUpInside);stack.addArrangedSubview(unlock)
    let cancel=UIButton(type:.system);cancel.setTitle(text("Vazgeç","Cancel"),for:.normal);cancel.addTarget(self,action:#selector(cancelRequest),for:.touchUpInside);stack.addArrangedSubview(cancel)
    let config=WKWebViewConfiguration();config.websiteDataStore = .nonPersistent();config.userContentController.add(self,name:"monokey")
    browser=WKWebView(frame:.zero,configuration:config);browser.navigationDelegate=self;browser.isHidden=true;view.addSubview(browser)
    guard let html=Bundle.main.url(forResource:"bridge",withExtension:"html") else {status.text=text("Uzantı kaynakları eksik.","Extension assets missing.");return}
    browser.loadFileURL(html,allowingReadAccessTo:html.deletingLastPathComponent())
    timer=Timer.scheduledTimer(withTimeInterval:120,repeats:false){[weak self]_ in self?.cancelRequest()}
    NotificationCenter.default.addObserver(self,selector:#selector(background),name:UIApplication.didEnterBackgroundNotification,object:nil)
  }
  override func prepareCredentialList(for serviceIdentifiers:[ASCredentialServiceIdentifier]) { services=serviceIdentifiers;loadViewIfNeeded() }
  override func provideCredentialWithoutUserInteraction(for credentialIdentity:ASPasswordCredentialIdentity) {extensionContext.cancelRequest(withError:NSError(domain:ASExtensionErrorDomain,code:ASExtensionError.userInteractionRequired.rawValue))}
  func webView(_ webView:WKWebView,decidePolicyFor navigationAction:WKNavigationAction,decisionHandler:@escaping(WKNavigationActionPolicy)->Void) { decisionHandler(navigationAction.request.url?.isFileURL == true ? .allow : .cancel) }
  func webView(_ webView:WKWebView,didFinish navigation:WKNavigation!) {
    guard Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillReviewed") as? Bool == true else {status.text=text("Cihaz güvenlik doğrulaması ve imzalama kurulumu bekleniyor.","Device security verification and signing setup pending.");password.isEnabled=false;return}
    guard let group=Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillGroup") as? String,let folder=FileManager.default.containerURL(forSecurityApplicationGroupIdentifier:group),let data=try? Data(contentsOf:folder.appendingPathComponent("vault-v1.json")),let snapshot=try? JSONSerialization.jsonObject(with:data) as? [String:Any],snapshot["namespace"] as? String == Bundle.main.object(forInfoDictionaryKey:"MonoKeyAutofillNamespace") as? String else {status.text=text("Önce Mono Key uygulamasında kasayı eşitleyin.","Sync your vault in Mono Key first.");return}
    let requested=services.map{["identifier":$0.identifier,"type":$0.type == .URL ? "url":"domain"]}
    guard let json=try? JSONSerialization.data(withJSONObject:[snapshot,requested]),let args=String(data:json,encoding:.utf8) else{return}
    browser.evaluateJavaScript("MonoKeyCredentialProvider.configure(..."+args+")"){[weak self]_,error in if error != nil {self?.status.text=self?.text("Kripto ortamı başlatılamadı.","Crypto environment unavailable.")}}
  }
  @objc private func toggleRecovery(){recovery.toggle();password.text="";password.placeholder=recovery ? text("Kurtarma kodu","Recovery code") : text("Kasa ana parolası","Vault master passphrase")}
  @objc private func unlockVault(){ guard password.isEnabled,let value=password.text,!value.isEmpty else{return};password.text="";password.resignFirstResponder();status.text=text("Kasa açılıyor…","Unlocking vault…");let args=try? JSONSerialization.data(withJSONObject:[value,recovery]);guard let args,let json=String(data:args,encoding:.utf8)else{return};browser.evaluateJavaScript("MonoKeyCredentialProvider.unlock(..."+json+")"){[weak self]_,error in if error != nil {self?.status.text=self?.text("Kasa açılamadı.","Unable to unlock vault.")}} }
  func userContentController(_ userContentController:WKUserContentController,didReceive message:WKScriptMessage){guard message.frameInfo.isMainFrame,let body=message.body as? [String:Any],let type=body["type"] as? String else{return}
    if type=="choices",let choices=body["items"] as? [[String:String]] {unlocked=true;buttons.forEach{$0.removeFromSuperview()};buttons=[];status.text=choices.isEmpty ? text("Bu kaynak için eşleşen kayıt yok.","No matching record for this origin.") : text("Doldurulacak kaydı seçin.","Choose a credential to fill.");for choice in choices {guard let id=choice["id"],let title=choice["title"] else{continue};let button=UIButton(type:.system);button.setTitle(title,for:.normal);button.addAction(UIAction{[weak self]_ in guard let self,self.unlocked else{return};self.chosen=true;let args=try? JSONSerialization.data(withJSONObject:[id]);if let args,let json=String(data:args,encoding:.utf8){self.browser.evaluateJavaScript("MonoKeyCredentialProvider.select(..."+json+")",completionHandler:nil)}},for:.touchUpInside);stack.addArrangedSubview(button);buttons.append(button)}}
    else if type=="credential",unlocked,chosen,let username=body["username"] as? String,let secret=body["password"] as? String {unlocked=false;chosen=false;timer?.invalidate();browser.evaluateJavaScript("MonoKeyCredentialProvider.lock()",completionHandler:nil);extensionContext.completeRequest(withSelectedCredential:ASPasswordCredential(user:username,password:secret),completionHandler:nil)}
    else if type=="failure" {unlocked=false;status.text=text("Kasa açılamadı. Ana parola veya kurtarma kodunu kontrol edin.","Unlock failed. Check your master passphrase or recovery code.")}
  }
  @objc private func background(){cancelRequest()}
  @objc private func cancelRequest(){unlocked=false;chosen=false;password.text="";buttons.forEach{$0.removeFromSuperview()};timer?.invalidate();browser?.evaluateJavaScript("MonoKeyCredentialProvider.lock()",completionHandler:nil);extensionContext.cancelRequest(withError:NSError(domain:ASExtensionErrorDomain,code:ASExtensionError.userCanceled.rawValue))}
  deinit {timer?.invalidate();NotificationCenter.default.removeObserver(self)}
}

chrome.runtime.onInstalled.addListener(() => chrome.idle.setDetectionInterval(60));
chrome.idle.onStateChanged.addListener(state => {
  if (state !== "active") {
    void chrome.storage.session.clear();
    void chrome.runtime.sendMessage({ type: "monokey:lock" }).catch(() => undefined);
  }
});
chrome.runtime.onSuspend.addListener(() => {
  void chrome.storage.session.clear();
  void chrome.runtime.sendMessage({ type: "monokey:lock" }).catch(() => undefined);
});

package expo.modules.monokeyautofill

import android.app.PendingIntent
import android.app.assist.AssistStructure
import android.content.Intent
import android.os.CancellationSignal
import android.os.SystemClock
import android.service.autofill.AutofillService
import android.service.autofill.FillCallback
import android.service.autofill.FillRequest
import android.service.autofill.FillResponse
import android.service.autofill.SaveCallback
import android.service.autofill.SaveRequest
import android.view.View
import android.view.autofill.AutofillId
import android.widget.RemoteViews
import java.util.UUID

internal data class MonoKeyFillRequest(val id: String, val packageName: String, val certificate: String, val usernameId: AutofillId, val passwordId: AutofillId, val expires: Long)
internal object MonoKeyAutofillRequests {
  private val requests = mutableMapOf<String, MonoKeyFillRequest>()
  @Synchronized fun put(value: MonoKeyFillRequest) { requests.clear(); requests[value.id] = value }
  @Synchronized fun get(id: String): MonoKeyFillRequest? { val request = requests[id]; if (request != null && request.expires > SystemClock.elapsedRealtime()) return request; requests.remove(id); return null }
  @Synchronized fun remove(id: String) { requests.remove(id) }
}
class MonoKeyAutofillService : AutofillService() {
  override fun onFillRequest(request: FillRequest, cancellationSignal: CancellationSignal, callback: FillCallback) {
    val structure = request.fillContexts.lastOrNull()?.structure ?: return callback.onSuccess(null)
    val target = structure.activityComponent.packageName
    val certificate = certificateFor(this, target) ?: return callback.onSuccess(null)
    var username: AutofillId? = null; var password: AutofillId? = null; var webContent = false
    var visited = 0; var oversized = false
    fun visit(node: AssistStructure.ViewNode, depth: Int = 0) {
      if (++visited > 2048 || depth > 32) { oversized = true; return }
      // Browser DOM metadata cannot establish an exact HTTPS origin here. Reject it.
      if (!node.webDomain.isNullOrEmpty()) webContent = true
      val hints = node.autofillHints.orEmpty()
      if (hints.any { it == View.AUTOFILL_HINT_USERNAME || it == View.AUTOFILL_HINT_EMAIL_ADDRESS }) username = node.autofillId
      if (hints.any { it == View.AUTOFILL_HINT_PASSWORD }) password = node.autofillId
      for (index in 0 until node.childCount) visit(node.getChildAt(index), depth + 1)
    }
    for (index in 0 until structure.windowNodeCount) visit(structure.getWindowNodeAt(index).rootViewNode)
    if (oversized || webContent || username == null || password == null || cancellationSignal.isCanceled) return callback.onSuccess(null)
    val id = UUID.randomUUID().toString()
    MonoKeyAutofillRequests.put(MonoKeyFillRequest(id, target, certificate, username!!, password!!, SystemClock.elapsedRealtime() + 120_000))
    cancellationSignal.setOnCancelListener { MonoKeyAutofillRequests.remove(id) }
    val intent = Intent().setClassName(packageName, packageName + ".MonoKeyAutofillActivity").putExtra("monokey.autofill.request", id)
    val pending = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val presentation = RemoteViews(packageName, android.R.layout.simple_list_item_1).apply { setTextViewText(android.R.id.text1, "Mono Key · Unlock vault") }
    callback.onSuccess(FillResponse.Builder().setAuthentication(arrayOf(username!!, password!!), pending.intentSender, presentation).build())
  }
  override fun onSaveRequest(request: SaveRequest, callback: SaveCallback) { callback.onSuccess() }
}

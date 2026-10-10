package expo.modules.monokeyautofill

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PersistableBundle
import android.provider.Settings
import android.view.autofill.AutofillManager
import android.view.autofill.AutofillValue
import android.service.autofill.Dataset
import android.service.autofill.FillResponse
import android.widget.RemoteViews
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.MessageDigest
import java.util.UUID

class MonoKeyAutofillModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MonoKeyAutofill")
    AsyncFunction("clearActionIntent") { appContext.currentActivity?.intent?.data = null }
    AsyncFunction("copy") { value: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("Native context unavailable")
      val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
      val label = "MonoKey-" + UUID.randomUUID().toString()
      val clip = ClipData.newPlainText(label, value)
      clip.description.extras = PersistableBundle().apply { putBoolean("android.content.extra.IS_SENSITIVE", true) }
      clipboard.setPrimaryClip(clip)
      Handler(Looper.getMainLooper()).postDelayed({
        if (clipboard.primaryClipDescription?.label == label) {
          if (Build.VERSION.SDK_INT >= 28) clipboard.clearPrimaryClip() else clipboard.setPrimaryClip(ClipData.newPlainText("", ""))
        }
      }, 30_000)
    }
    AsyncFunction("pendingRequest") {
      val activity = appContext.currentActivity
      val id = activity?.intent?.getStringExtra("monokey.autofill.request")
      val request = id?.let { MonoKeyAutofillRequests.get(it) }
      if (request == null) null else mapOf("id" to request.id, "packageName" to request.packageName, "certificateSha256" to request.certificate)
    }
    AsyncFunction("complete") { id: String, packageName: String, certificate: String, username: String, password: String ->
      val activity = appContext.currentActivity ?: throw IllegalStateException("Activity unavailable")
      val request = MonoKeyAutofillRequests.get(id) ?: throw IllegalStateException("Autofill request expired")
      check(activity.intent?.getStringExtra("monokey.autofill.request") == id)
      check(packageName == request.packageName && certificate == request.certificate)
      check(certificateFor(activity, packageName) == certificate)
      check(username.isNotEmpty() && password.isNotEmpty())
      val presentation = RemoteViews(activity.packageName, android.R.layout.simple_list_item_1).apply { setTextViewText(android.R.id.text1, "Mono Key") }
      val dataset = Dataset.Builder(presentation).setValue(request.usernameId, AutofillValue.forText(username)).setValue(request.passwordId, AutofillValue.forText(password)).build()
      val result = FillResponse.Builder().addDataset(dataset).build()
      MonoKeyAutofillRequests.remove(id)
      activity.runOnUiThread { activity.setResult(Activity.RESULT_OK, Intent().putExtra(AutofillManager.EXTRA_AUTHENTICATION_RESULT, result)); activity.finish() }
    }
    AsyncFunction("cancel") {
      val activity = appContext.currentActivity
      activity?.intent?.getStringExtra("monokey.autofill.request")?.let { MonoKeyAutofillRequests.remove(it) }
      if (activity?.intent?.hasExtra("monokey.autofill.request") == true) activity.runOnUiThread { activity.setResult(Activity.RESULT_CANCELED); activity.finish() }
    }
    AsyncFunction("enableSettings") {
      val activity = appContext.currentActivity ?: throw IllegalStateException("Activity unavailable")
      activity.startActivity(Intent(Settings.ACTION_REQUEST_SET_AUTOFILL_SERVICE).setData(android.net.Uri.parse("package:" + activity.packageName)))
    }
  }
}
internal fun certificateFor(context: Context, name: String): String? {
  return try {
    val signatures = if (Build.VERSION.SDK_INT >= 28) context.packageManager.getPackageInfo(name, PackageManager.GET_SIGNING_CERTIFICATES).signingInfo?.apkContentsSigners
      else @Suppress("DEPRECATION") context.packageManager.getPackageInfo(name, PackageManager.GET_SIGNATURES).signatures
    if (signatures?.size != 1) null else MessageDigest.getInstance("SHA-256").digest(signatures[0].toByteArray()).joinToString("") { "%02X".format(it) }
  } catch (_: Exception) { null }
}

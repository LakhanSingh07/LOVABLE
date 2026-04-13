package com.cutucanvas.wallpaper

import android.content.Context
import android.content.Intent
import org.json.JSONObject

class WallpaperRepository(context: Context) {
  private val appContext = context.applicationContext
  private val sharedPreferences =
    appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  fun savePayload(payload: String) {
    val success = sharedPreferences
      .edit()
      .putString(KEY_CANVAS_PAYLOAD, payload)
      .putLong(KEY_UPDATED_AT, System.currentTimeMillis())
      .commit()

    check(success) { "Unable to persist wallpaper payload." }
  }

  fun readPayload(): String? = sharedPreferences.getString(KEY_CANVAS_PAYLOAD, null)

  fun readPartnerName(): String? = readPayloadField("partnerName")

  fun readMessage(): String? = readPayloadField("message")

  private fun readPayloadField(fieldName: String): String? {
    val payload = readPayload() ?: return null
    return runCatching {
      JSONObject(payload).optString(fieldName).takeIf { it.isNotBlank() }
    }.getOrNull()
  }

  fun notifyChanged() {
    val intent = Intent(ACTION_CANVAS_CACHE_UPDATED).setPackage(appContext.packageName)
    appContext.sendBroadcast(intent)
    CutuWidgetProvider.updateAll(appContext)
  }

  companion object {
    const val ACTION_CANVAS_CACHE_UPDATED = "com.cutucanvas.action.CANVAS_CACHE_UPDATED"
    private const val PREFS_NAME = "cutu_canvas_wallpaper"
    private const val KEY_CANVAS_PAYLOAD = "canvas_payload"
    private const val KEY_UPDATED_AT = "updated_at"
  }
}

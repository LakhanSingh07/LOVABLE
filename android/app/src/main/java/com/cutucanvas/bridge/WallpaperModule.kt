package com.cutucanvas.bridge

import android.app.WallpaperManager
import android.content.ComponentName
import android.content.Intent
import com.cutucanvas.wallpaper.CutuWallpaperService
import com.cutucanvas.wallpaper.WallpaperRepository
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WallpaperModule(
  reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  private val repository = WallpaperRepository(reactContext)

  override fun getName(): String = "WallpaperModule"

  @ReactMethod
  fun updateWallpaperCache(payload: String, promise: Promise) {
    if (payload.isBlank()) {
      promise.reject("EMPTY_PAYLOAD", "Canvas payload must not be empty.")
      return
    }

    runCatching {
      repository.savePayload(payload)
      repository.notifyChanged()
    }.onSuccess {
      promise.resolve(true)
    }.onFailure { error ->
      promise.reject("CACHE_WRITE_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun openWallpaperPicker(promise: Promise) {
    val activity = currentActivity
    val appContext = reactApplicationContext
    val intent = Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER).apply {
      putExtra(
        WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
        ComponentName(appContext, CutuWallpaperService::class.java),
      )
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    runCatching {
      (activity ?: appContext).startActivity(intent)
    }.onSuccess {
      promise.resolve(true)
    }.onFailure { error ->
      promise.reject("WALLPAPER_PICKER_FAILED", error.message, error)
    }
  }
}

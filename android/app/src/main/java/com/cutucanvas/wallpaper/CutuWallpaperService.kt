package com.cutucanvas.wallpaper

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.service.wallpaper.WallpaperService
import android.view.SurfaceHolder
import androidx.core.content.ContextCompat

class CutuWallpaperService : WallpaperService() {
  override fun onCreateEngine(): Engine = CutuEngine()

  inner class CutuEngine : Engine() {
    private val repository = WallpaperRepository(this@CutuWallpaperService)
    private val renderer = WallpaperCanvasRenderer()
    private var visible = false
    private var surfaceWidth = 0
    private var surfaceHeight = 0

    private val refreshReceiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context?, intent: Intent?) {
        drawFrame()
      }
    }

    override fun onCreate(surfaceHolder: SurfaceHolder) {
      super.onCreate(surfaceHolder)
      ContextCompat.registerReceiver(
        this@CutuWallpaperService,
        refreshReceiver,
        IntentFilter(WallpaperRepository.ACTION_CANVAS_CACHE_UPDATED),
        ContextCompat.RECEIVER_NOT_EXPORTED,
      )
    }

    override fun onDestroy() {
      unregisterReceiver(refreshReceiver)
      super.onDestroy()
    }

    override fun onVisibilityChanged(isVisible: Boolean) {
      visible = isVisible
      if (visible) {
        drawFrame()
      }
    }

    override fun onSurfaceCreated(holder: SurfaceHolder) {
      super.onSurfaceCreated(holder)
      drawFrame()
    }

    override fun onSurfaceChanged(
      holder: SurfaceHolder,
      format: Int,
      width: Int,
      height: Int,
    ) {
      super.onSurfaceChanged(holder, format, width, height)
      surfaceWidth = width
      surfaceHeight = height
      drawFrame()
    }

    private fun drawFrame() {
      if (!visible && surfaceWidth > 0 && surfaceHeight > 0) {
        return
      }

      val canvas = runCatching { surfaceHolder.lockCanvas() }.getOrNull() ?: return

      try {
        val width = if (surfaceWidth > 0) surfaceWidth else canvas.width
        val height = if (surfaceHeight > 0) surfaceHeight else canvas.height
        renderer.draw(canvas, repository.readPayload(), width, height)
      } finally {
        surfaceHolder.unlockCanvasAndPost(canvas)
      }
    }
  }
}

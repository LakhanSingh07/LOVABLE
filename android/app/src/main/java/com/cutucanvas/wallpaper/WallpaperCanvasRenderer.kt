package com.cutucanvas.wallpaper

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Bitmap
import org.json.JSONArray
import org.json.JSONObject

class WallpaperCanvasRenderer {
  private val fallbackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = Color.parseColor("#FF6B9D")
    strokeCap = Paint.Cap.ROUND
    strokeJoin = Paint.Join.ROUND
    style = Paint.Style.STROKE
    strokeWidth = 6f
  }

  fun draw(canvas: Canvas, payload: String?, targetWidth: Int, targetHeight: Int) {
    canvas.drawColor(Color.parseColor("#09111F"))

    if (payload.isNullOrBlank()) {
      return
    }

    runCatching {
      val root = JSONObject(payload)
      val viewport = root.optJSONObject("viewport")
      val sourceWidth =
        viewport?.optDouble("width", targetWidth.toDouble()) ?: targetWidth.toDouble()
      val sourceHeight =
        viewport?.optDouble("height", targetHeight.toDouble()) ?: targetHeight.toDouble()
      val scaleX =
        if (sourceWidth > 0) targetWidth.toFloat() / sourceWidth.toFloat() else 1f
      val scaleY =
        if (sourceHeight > 0) targetHeight.toFloat() / sourceHeight.toFloat() else 1f

      val strokes = root.optJSONArray("strokes") ?: JSONArray()
      for (index in 0 until strokes.length()) {
        val stroke = strokes.optJSONObject(index) ?: continue
        val points = stroke.optJSONArray("points") ?: continue
        if (points.length() < 2) {
          continue
        }

        val strokeColor = stroke.optString("color", "#FF6B9D")
        val strokeWidth = stroke.optDouble("width", 6.0).toFloat()
        val paint = Paint(fallbackPaint).apply {
          color = parseColorSafely(strokeColor)
          this.strokeWidth = strokeWidth * ((scaleX + scaleY) / 2f)
        }

        for (pointIndex in 1 until points.length()) {
          val previous = points.optJSONObject(pointIndex - 1) ?: continue
          val current = points.optJSONObject(pointIndex) ?: continue

          val startX = previous.optDouble("x", 0.0).toFloat() * scaleX
          val startY = previous.optDouble("y", 0.0).toFloat() * scaleY
          val stopX = current.optDouble("x", 0.0).toFloat() * scaleX
          val stopY = current.optDouble("y", 0.0).toFloat() * scaleY

          canvas.drawLine(startX, startY, stopX, stopY, paint)
        }
      }
    }
  }

  fun renderBitmap(
    payload: String?,
    targetWidth: Int,
    targetHeight: Int,
  ): Bitmap {
    val bitmap = Bitmap.createBitmap(
      targetWidth.coerceAtLeast(1),
      targetHeight.coerceAtLeast(1),
      Bitmap.Config.ARGB_8888,
    )
    val canvas = Canvas(bitmap)
    draw(canvas, payload, targetWidth, targetHeight)
    return bitmap
  }

  private fun parseColorSafely(colorValue: String): Int {
    return runCatching { Color.parseColor(colorValue) }
      .getOrDefault(Color.parseColor("#FF6B9D"))
  }
}

package com.cutucanvas.wallpaper

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.cutucanvas.MainActivity
import com.cutucanvas.R

class CutuWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(
    context: Context,
    appWidgetManager: AppWidgetManager,
    appWidgetIds: IntArray,
  ) {
    updateWidgets(context, appWidgetManager, appWidgetIds)
  }

  companion object {
    fun updateAll(context: Context) {
      val appWidgetManager = AppWidgetManager.getInstance(context)
      val componentName = ComponentName(context, CutuWidgetProvider::class.java)
      val widgetIds = appWidgetManager.getAppWidgetIds(componentName)
      if (widgetIds.isNotEmpty()) {
        updateWidgets(context, appWidgetManager, widgetIds)
      }
    }

    private fun updateWidgets(
      context: Context,
      appWidgetManager: AppWidgetManager,
      appWidgetIds: IntArray,
    ) {
      val repository = WallpaperRepository(context)
      val renderer = WallpaperCanvasRenderer()
      val payload = repository.readPayload()
      val partnerName = repository.readPartnerName() ?: "Your person"
      val message = repository.readMessage() ?: "New canvas moment waiting for you."

      appWidgetIds.forEach { appWidgetId ->
        val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
        val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 280)
        val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 180)
        val bitmap = renderer.renderBitmap(payload, minWidth * 3, minHeight * 3)

        val openIntent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
          context,
          appWidgetId,
          openIntent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val views = RemoteViews(context.packageName, R.layout.widget_cutu_canvas).apply {
          setTextViewText(R.id.widget_partner_name, "For $partnerName")
          setTextViewText(R.id.widget_message, message)
          setImageViewBitmap(R.id.widget_drawing_image, bitmap)
          setOnClickPendingIntent(R.id.widget_root, pendingIntent)
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
      }
    }
  }
}

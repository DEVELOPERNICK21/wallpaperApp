package com.wallpe

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.widget.RemoteViews
import java.util.Calendar

class YearProgressWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val calendar = Calendar.getInstance()
        val dayOfYear = calendar.get(Calendar.DAY_OF_YEAR)
        val totalDaysInYear = calendar.getActualMaximum(Calendar.DAY_OF_YEAR)
        val daysPassed = dayOfYear
        val daysLeft = totalDaysInYear - daysPassed
        val percentage = (daysPassed.toDouble() / totalDaysInYear) * 100

        val views = RemoteViews(context.packageName, R.layout.widget_year_progress).apply {
            setTextViewText(R.id.widget_days_passed_value, context.getString(R.string.widget_days_passed_format, daysPassed))
            setTextViewText(R.id.widget_days_left_value, context.getString(R.string.widget_days_left_format, daysLeft))
            setTextViewText(R.id.widget_percentage, context.getString(R.string.widget_percentage_value, percentage))

            val openAppIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val rootPendingIntent = PendingIntent.getActivity(
                context,
                0,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            setOnClickPendingIntent(R.id.widget_root, rootPendingIntent)

            val daysPassedPendingIntent = PendingIntent.getActivity(
                context,
                200,
                Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("widget_action", "days_passed")
                },
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            setOnClickPendingIntent(R.id.widget_days_passed_value, daysPassedPendingIntent)

            val daysLeftPendingIntent = PendingIntent.getActivity(
                context,
                201,
                Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("widget_action", "days_left")
                },
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            setOnClickPendingIntent(R.id.widget_days_left_value, daysLeftPendingIntent)

            val percentagePendingIntent = PendingIntent.getActivity(
                context,
                202,
                Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("widget_action", "percentage")
                },
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            setOnClickPendingIntent(R.id.widget_percentage, percentagePendingIntent)

            val yearDotsBitmap = createYearDotsBitmap(dayOfYear, totalDaysInYear)
            setImageViewBitmap(R.id.widget_year_dots, yearDotsBitmap)
            yearDotsBitmap.recycle()
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun createYearDotsBitmap(dayOfYear: Int, totalDaysInYear: Int): Bitmap {
        val cols = 25
        val rows = 15
        val cellWidthPx = 45
        val cellHeightPx = 70
        val dotRadiusPx = 18f
        val bitmapWidth = cols * cellWidthPx
        val bitmapHeight = rows * cellHeightPx
        val bitmap = Bitmap.createBitmap(bitmapWidth, bitmapHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.drawColor(Color.TRANSPARENT)

        val passedPaint = Paint().apply {
            color = 0xFFBB86FC.toInt()
            isAntiAlias = true
            style = Paint.Style.FILL
        }
        val pendingPaint = Paint().apply {
            color = 0xFF333333.toInt()
            isAntiAlias = true
            style = Paint.Style.FILL
        }

        val totalDots = 365
        for (dayIndex in 0 until totalDots) {
            val day = dayIndex + 1
            val col = dayIndex % cols
            val row = dayIndex / cols
            val cx = col * cellWidthPx + cellWidthPx / 2f
            val cy = row * cellHeightPx + cellHeightPx / 2f
            val paint = if (day <= dayOfYear) passedPaint else pendingPaint
            canvas.drawCircle(cx, cy, dotRadiusPx, paint)
        }

        return bitmap
    }
}

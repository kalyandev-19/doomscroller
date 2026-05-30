package com.scrollstop.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.scrollstop.ui.BlockOverlayWindow

/**
 * ScrollStopForegroundService coordinates monitoring state and displays overlays when limits are met.
 * Being a foreground service makes it resistant to system force-kills.
 */
class ScrollStopForegroundService : Service() {

    companion object {
        private const val TAG = "ScrollStopService"
        private const val NOTIFICATION_CHANNEL_ID = "scrollstop_status_channel"
        private const val NOTIFICATION_ID = 404
        
        // Actions
        const val ACTION_INCREMENT_SCROLL = "com.scrollstop.action.INCREMENT_SCROLL"
        const val ACTION_RESET_LIMIT = "com.scrollstop.action.RESET_LIMIT"
    }

    private var reelsWatchedToday = 0
    private var dailyScrollLimit = 15 // Loaded from SharedPreferences in real app
    private var isBlocked = false

    private lateinit var blockOverlayWindow: BlockOverlayWindow

    override fun onCreate() {
        super.onCreate();
        Log.i(TAG, "Foreground service creating")
        blockOverlayWindow = BlockOverlayWindow(this)
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildStatusNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.action?.let { action ->
            when (action) {
                ACTION_INCREMENT_SCROLL -> handleScrollIncrement()
                ACTION_RESET_LIMIT -> handleLimitReset()
            }
        }
        return START_STICKY // System will restart service if killed
    }

    private fun handleScrollIncrement() {
        reelsWatchedToday++
        Log.i(TAG, "Scroll event logged: $reelsWatchedToday / $dailyScrollLimit")
        
        // Update persistent notification status
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildStatusNotification())

        if (reelsWatchedToday >= dailyScrollLimit && !isBlocked) {
            triggerBlockOverlay()
        }
    }

    private fun handleLimitReset() {
        reelsWatchedToday = 0
        isBlocked = false
        blockOverlayWindow.dismiss()
        
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildStatusNotification())
        Log.i(TAG, "Limit reset. Overlay dismissed.")
    }

    private fun triggerBlockOverlay() {
        isBlocked = true
        Log.w(TAG, "Limit reached. Spawning block overlay.")
        blockOverlayWindow.show()
    }

    private fun buildStatusNotification(): Notification {
        val message = if (reelsWatchedToday >= dailyScrollLimit) {
            "Daily limit reached. Reels block active."
        } else {
            "Monitored: $reelsWatchedToday / $dailyScrollLimit reels watched today."
        }

        // Action intent to launch settings from notification
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent, 
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("ScrollStop Active")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_lock_lock) // System lock icon as fallback
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "ScrollStop System Status",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps ScrollStop foreground service active and updates daily stats"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        blockOverlayWindow.dismiss()
        super.onDestroy()
        Log.w(TAG, "Foreground service destroyed")
    }
}

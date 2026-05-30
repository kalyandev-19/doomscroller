package com.scrollstop.ui

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import java.util.Locale

/**
 * BlockOverlayWindow manages the low-level overlay layout drawn directly onto the screen.
 * It configures WindowManager flags to block user navigation, multitasking, and gestures.
 */
class BlockOverlayWindow(private val context: Context) {

    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayView: OverlayViewGroup? = null
    private var isShowing = false
    
    // Cooldown duration timer state
    private var timeSecondsRemaining = 7200 // 2 hours
    private val handler = Handler(Looper.getMainLooper())
    private var timerRunnable: Runnable? = null

    /**
     * OverlayViewGroup intercepts system back buttons and gestures.
     */
    private inner class OverlayViewGroup(context: Context) : LinearLayout(context) {
        init {
            // Layout params
            orientation = VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0a0b10")) // Deep slate
            setPadding(60, 100, 60, 100)
            
            // Render components dynamically
            val titleView = TextView(context).apply {
                text = "Time to Step Away"
                setTextColor(Color.WHITE)
                textSize = 24f
                gravity = Gravity.CENTER
                setPadding(0, 0, 0, 30)
            }
            addView(titleView)

            val descView = TextView(context).apply {
                text = "You've scrolled past your daily Reels & Shorts limit.\nRecharge your real-world energy."
                setTextColor(Color.parseColor("#a0a5c0"))
                textSize = 14f
                gravity = Gravity.CENTER
                setPadding(0, 0, 0, 100)
            }
            addView(descView)

            // Timer display
            val timerView = TextView(context).apply {
                id = View.generateViewId()
                text = "02:00:00"
                setTextColor(Color.parseColor("#ffa726")) // Warm amber
                textSize = 36f
                gravity = Gravity.CENTER
                setPadding(0, 0, 0, 100)
            }
            addView(timerView)
            
            // Custom actions / alternatives
            val walkButton = Button(context).apply {
                text = "Take a 10-Minute Walk"
                setBackgroundColor(Color.parseColor("#121420"))
                setTextColor(Color.WHITE)
                setPadding(20, 20, 20, 20)
            }
            addView(walkButton)

            // Start timer count inside view group
            startTimer(timerView)
        }

        override fun dispatchKeyEvent(event: KeyEvent): Boolean {
            // Intercept and swallow the BACK key and other system actions to prevent dismiss
            if (event.keyCode == KeyEvent.KEYCODE_BACK || event.keyCode == KeyEvent.KEYCODE_HOME) {
                return true // Return true to indicate we consumed the event
            }
            return super.dispatchKeyEvent(event)
        }
    }

    fun show() {
        if (isShowing) return

        val layoutParams = WindowManager.LayoutParams().apply {
            width = WindowManager.LayoutParams.MATCH_PARENT
            height = WindowManager.LayoutParams.MATCH_PARENT
            
            // SYSTEM_ALERT_WINDOW overlays require TYPE_APPLICATION_OVERLAY on Android O+
            type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            }
            
            // Important bypass prevention flags:
            // FLAG_NOT_TOUCH_MODAL: Touch events outside are sent to this window
            // FLAG_LAYOUT_IN_SCREEN: Cover navigation bars, status bars, and notch areas
            // FLAG_FULLSCREEN: Hide system status bar
            flags = (WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL
                    or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                    or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                    or WindowManager.LayoutParams.FLAG_FULLSCREEN
                    or WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            
            format = PixelFormat.TRANSLUCENT
            screenOrientation = android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }

        overlayView = OverlayViewGroup(context)
        windowManager.addView(overlayView, layoutParams)
        isShowing = true
    }

    fun dismiss() {
        if (!isShowing) return
        
        timerRunnable?.let { handler.removeCallbacks(it) }
        overlayView?.let { windowManager.removeView(it) }
        overlayView = null
        isShowing = false
    }

    private fun startTimer(timerTextView: TextView) {
        timerRunnable = object : Runnable {
            override fun run() {
                if (timeSecondsRemaining > 0) {
                    timeSecondsRemaining--
                    val hours = timeSecondsRemaining / 3600
                    val minutes = (timeSecondsRemaining % 3600) / 60
                    val seconds = timeSecondsRemaining % 60
                    timerTextView.text = String.format(Locale.US, "%02d:%02d:%02d", hours, minutes, seconds)
                    handler.postDelayed(this, 1000)
                } else {
                    // Lock duration elapsed, notify app to dismiss
                    val intent = Intent(context, ScrollStopForegroundService::class.java).apply {
                        action = ScrollStopForegroundService.ACTION_RESET_LIMIT
                    }
                    context.startService(intent)
                }
            }
        }
        handler.post(timerRunnable as Runnable)
    }
}

package com.scrollstop.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.scrollstop.service.ScrollStopForegroundService

/**
 * BootReceiver detects phone reboots and starts the monitoring service immediately.
 * This prevents users from bypassing limits by restarting their phone.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.i("ScrollStopBoot", "Device reboot complete. Launching ScrollStop service.")
            
            val serviceIntent = Intent(context, ScrollStopForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}

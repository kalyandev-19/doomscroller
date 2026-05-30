package com.scrollstop.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.util.Log

/**
 * ScrollStopAccessibilityService uses Android Accessibility APIs to detect active scrolling
 * on Instagram Reels and YouTube Shorts. It filters content based on package name,
 * view hierarchy inspections, and gesture events.
 */
class ScrollStopAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "ScrollStopAccess"
        private const val INSTAGRAM_PACKAGE = "com.instagram.android"
        private const val YOUTUBE_PACKAGE = "com.google.android.youtube"
        
        // Track unique video elements based on hash codes or text descriptors to avoid double counting a single view
        private var lastViewedContentHash: Int = 0
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return
        
        // Filter actions strictly for targeted platforms to conserve CPU cycles
        if (packageName != INSTAGRAM_PACKAGE && packageName != YOUTUBE_PACKAGE) {
            return
        }

        when (event.eventType) {
            AccessibilityEvent.TYPE_VIEW_SCROLLED, 
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                val rootNode = rootInActiveWindow ?: return
                inspectHierarchy(rootNode, packageName)
            }
        }
    }

    /**
     * Inspects active window hierarchy node-by-node.
     * Identifies Reels/Shorts container panels and increments scrolls.
     */
    private fun inspectHierarchy(node: AccessibilityNodeInfo, packageName: String) {
        // Evaluate package-specific window structure
        if (packageName == INSTAGRAM_PACKAGE) {
            // Instagram Reels: Check for view container classes and specific resource IDs
            // The main Reels pager layout uses specific IDs e.g., 'reels_viewer_view_pager' or 'reels_viewer_container'
            val reelsPager = findNodeByViewId(node, "com.instagram.android:id/reels_viewer_view_pager")
            val reelsTabSelected = isInstagramReelsTabSelected(node)
            
            if (reelsPager != null || reelsTabSelected) {
                // Determine current video identifier by checking description text or publisher handle
                val authorNode = findNodeByViewId(node, "com.instagram.android:id/reels_viewer_username")
                val authorText = authorNode?.text?.toString() ?: ""
                
                if (authorText.isNotEmpty() && authorText.hashCode() != lastViewedContentHash) {
                    lastViewedContentHash = authorText.hashCode()
                    Log.d(TAG, "Instagram Reel scroll detected. Author: $authorText")
                    notifyScrollTracked()
                }
            }
        } else if (packageName == YOUTUBE_PACKAGE) {
            // YouTube Shorts: Check for Shorts pager containers or feed views
            // YouTube Shorts uses view id 'shorts_player_pager' or view class 'ShortsContainer'
            val shortsPager = findNodeByViewId(node, "com.google.android.youtube:id/shorts_player_pager")
            
            if (shortsPager != null) {
                // Get title or description of current Short to identify change
                val titleNode = findNodeByViewId(node, "com.google.android.youtube:id/shorts_title")
                val descText = titleNode?.text?.toString() ?: ""
                
                if (descText.isNotEmpty() && descText.hashCode() != lastViewedContentHash) {
                    lastViewedContentHash = descText.hashCode()
                    Log.d(TAG, "YouTube Short scroll detected. Title: $descText")
                    notifyScrollTracked()
                }
            }
        }
    }

    /**
     * Finds nodes recursively matched by view ID
     */
    private fun findNodeByViewId(node: AccessibilityNodeInfo?, viewId: String): AccessibilityNodeInfo? {
        if (node == null) return null
        val found = node.findAccessibilityNodeInfosByViewId(viewId)
        if (found.isNotEmpty()) {
            return found[0]
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val result = findNodeByViewId(child, viewId)
            if (result != null) return result
        }
        return null
    }

    /**
     * Checks if the active bottom bar tab on Instagram is the Reels Tab.
     */
    private fun isInstagramReelsTabSelected(node: AccessibilityNodeInfo): Boolean {
        // Typically, the bottom bar tabs have content descriptions "Reels" or "Reels Tab"
        val tabs = node.findAccessibilityNodeInfosByText("Reels")
        for (tab in tabs) {
            if (tab.isClickable && tab.isSelected) {
                return true
            }
        }
        return false
    }

    /**
     * Dispatches intent to ScrollStopForegroundService to update scroll progress
     */
    private fun notifyScrollTracked() {
        val intent = Intent(this, ScrollStopForegroundService::class.java).apply {
            action = ScrollStopForegroundService.ACTION_INCREMENT_SCROLL
        }
        startService(intent)
    }

    override fun onInterrupt() {
        Log.w(TAG, "Accessibility Service interrupted")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.i(TAG, "ScrollStop Accessibility Service linked successfully")
    }
}

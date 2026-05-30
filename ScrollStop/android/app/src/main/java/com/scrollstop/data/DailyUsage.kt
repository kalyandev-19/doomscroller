package com.scrollstop.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entity class mapping scroll usage telemetry database rows.
 */
@Entity(tableName = "daily_usage_stats")
data class DailyUsage(
    @PrimaryKey
    val dateString: String, // Format: YYYY-MM-DD
    val scrollLimit: Int,
    val countWatched: Int
)

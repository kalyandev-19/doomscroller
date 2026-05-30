package com.scrollstop.data

import android.content.Context
import androidx.room.*

@Dao
interface DailyUsageDao {
    @Query("SELECT * FROM daily_usage_stats WHERE dateString = :date LIMIT 1")
    suspend fun getUsageForDate(date: String): DailyUsage?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateUsage(usage: DailyUsage)

    @Query("SELECT * FROM daily_usage_stats ORDER BY dateString DESC LIMIT 7")
    suspend fun getWeeklyStats(): List<DailyUsage>

    @Query("DELETE FROM daily_usage_stats")
    suspend fun clearAllStats()
}

@Database(entities = [DailyUsage::class], version = 1, exportSchema = false)
abstract class ScrollStopDatabase : RoomDatabase() {
    
    abstract fun dailyUsageDao(): DailyUsageDao

    companion object {
        @Volatile
        private var INSTANCE: ScrollStopDatabase? = null

        fun getDatabase(context: Context): ScrollStopDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ScrollStopDatabase::class.java,
                    "scrollstop_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}

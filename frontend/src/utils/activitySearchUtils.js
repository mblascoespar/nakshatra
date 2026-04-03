import { getNakshatrasForActivity } from '../data/activityIndex'

/**
 * Search calendar for auspicious days to perform an activity.
 *
 * Filters to ONLY days with Tara tier "very_good" or "good"
 * Sorts by tier (very_good first), then by date (earliest first)
 *
 * @param {Object} activity - Activity object with id, displayText
 * @param {Object} calendarData - Full year calendar data
 * @param {Date} dateFrom - Start of search range
 * @param {Date} dateTo - End of search range
 * @returns {Array} Filtered and sorted results
 */
export function performActivitySearch(
  activity,
  calendarData,
  dateFrom,
  dateTo
) {
  // Get nakshatras that have this activity
  const nakshatras = getNakshatrasForActivity(activity.id)
  if (!nakshatras.length) return []

  // Flatten calendar to array of all days
  const allDays = calendarData.months.flatMap((m) => m.days)

  // Filter and rank results
  const results = allDays
    .filter((day) => {
      // Date range check
      const dayDate = new Date(day.date)
      if (dayDate < dateFrom || dayDate > dateTo) return false

      // Nakshatra check: day must have this activity
      if (!nakshatras.includes(day.sunrise_nakshatra_id)) return false

      // ⭐ TARA QUALITY FILTER: only good or very_good days
      const favorableTaras = ['very_good', 'good']
      if (!favorableTaras.includes(day.tarabalam_tier)) return false

      return true
    })
    .sort((a, b) => {
      // Sort by Tara tier first (very_good before good)
      const tierOrder = { very_good: 1, good: 2 }
      const tierDiff = tierOrder[a.tarabalam_tier] - tierOrder[b.tarabalam_tier]
      if (tierDiff !== 0) return tierDiff

      // Then by date (earliest first)
      return new Date(a.date) - new Date(b.date)
    })

  return results
}

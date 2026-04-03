import { getNakshatrasForActivity, ACTIVITIES } from '../data/activityIndex'
import { buildTimelineSegments } from './timelineUtils'

/**
 * Get activities by their IDs
 * @param {number[]} activityIds - Array of activity IDs
 * @returns {Array} Activities matching the IDs
 */
export function getActivitiesByIds(activityIds) {
  return activityIds.map((id) => ACTIVITIES.find((a) => a.id === id)).filter(Boolean)
}

/**
 * Search calendar for auspicious days to perform an activity.
 *
 * Checks all timeline segments within each day (not just sunrise nakshatra).
 * Returns days where ANY segment has the activity with favorable tara.
 * Sorts by best tara tier found in that day, then by date.
 *
 * @param {Object} activity - Activity object with id, displayText
 * @param {Object} calendarData - Full year calendar data
 * @param {Date} dateFrom - Start of search range
 * @param {Date} dateTo - End of search range
 * @param {number} birthNakshatraId - User's birth nakshatra ID (for tara computation)
 * @returns {Array} Filtered and sorted results
 */
export function performActivitySearch(
  activity,
  calendarData,
  dateFrom,
  dateTo,
  birthNakshatraId
) {
  // Get nakshatras that have this activity
  const nakshatras = getNakshatrasForActivity(activity.id)
  if (!nakshatras.length) return []

  // Flatten calendar to array of all days
  const allDays = calendarData.months.flatMap((m) => m.days)
  const favorableTaras = ['very_good', 'good']

  // Filter and rank results
  const results = allDays
    .map((day) => {
      // Date range check
      const dayDate = new Date(day.date)
      if (dayDate < dateFrom || dayDate > dateTo) return null

      // Build timeline segments for this day
      const segments = buildTimelineSegments(day, birthNakshatraId)

      // Find all segments where:
      // 1. Nakshatra has the activity
      // 2. Tara tier is favorable (very_good or good)
      const matchingSegments = segments.filter(
        (seg) => nakshatras.includes(seg.nakshatra_id) && favorableTaras.includes(seg.tara.tier)
      )

      // If no matching segments, day is not auspicious for this activity
      if (matchingSegments.length === 0) return null

      // Track the best tara tier found in this day for sorting
      const bestTier = matchingSegments.some((s) => s.tara.tier === 'very_good')
        ? 'very_good'
        : 'good'

      return { day, bestTier }
    })
    .filter(Boolean)  // Remove nulls
    .sort((a, b) => {
      // Sort by best tara tier first (very_good before good)
      const tierOrder = { very_good: 1, good: 2 }
      const tierDiff = tierOrder[a.bestTier] - tierOrder[b.bestTier]
      if (tierDiff !== 0) return tierDiff

      // Then by date (earliest first)
      const dateA = new Date(a.day.date).getTime()
      const dateB = new Date(b.day.date).getTime()
      return dateA - dateB
    })
    .map((result) => result.day)  // Extract just the day object

  return results
}

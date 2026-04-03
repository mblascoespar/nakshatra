import { taraForDay, nakshatraById, TARAS } from '../data/tarabalam'

/**
 * Build timeline segments from a day's nakshatra transitions.
 *
 * Each segment represents a continuous period under one nakshatra.
 * Returns segments with start/end times and computed Tara values.
 *
 * @param {Object} day - Day object with nakshatra_transitions array
 * @param {number} birthNakshatraId - User's birth nakshatra ID
 * @returns {Array} Array of segment objects
 */
export function buildTimelineSegments(day, birthNakshatraId) {
  if (!day.nakshatra_transitions || day.nakshatra_transitions.length === 0) {
    // Single segment for the whole day
    return [{
      startTime: '00:00',
      endTime: '23:59',
      nakshatra_id: day.sunrise_nakshatra_id,
      nakshatra_name: day.sunrise_nakshatra_name,
      tara: taraForDay(birthNakshatraId, day.sunrise_nakshatra_id),
      activities: nakshatraById(day.sunrise_nakshatra_id).activities,
    }]
  }

  const segments = []
  const transitions = day.nakshatra_transitions

  // First segment: from start of day to first transition
  segments.push({
    startTime: '00:00',
    endTime: transitions[0].time,
    nakshatra_id: day.sunrise_nakshatra_id,
    nakshatra_name: day.sunrise_nakshatra_name,
    tara: taraForDay(birthNakshatraId, day.sunrise_nakshatra_id),
    activities: nakshatraById(day.sunrise_nakshatra_id).activities,
  })

  // Middle segments: between transitions
  for (let i = 0; i < transitions.length - 1; i++) {
    const nakId = transitions[i].nakshatra_id
    const nak = nakshatraById(nakId)

    segments.push({
      startTime: transitions[i].time,
      endTime: transitions[i + 1].time,
      nakshatra_id: nakId,
      nakshatra_name: nak.name,
      tara: taraForDay(birthNakshatraId, nakId),
      activities: nak.activities,
    })
  }

  // Last segment: from last transition to end of day
  const lastTransition = transitions[transitions.length - 1]
  const lastNakId = lastTransition.nakshatra_id
  const lastNak = nakshatraById(lastNakId)

  segments.push({
    startTime: lastTransition.time,
    endTime: '23:59',
    nakshatra_id: lastNakId,
    nakshatra_name: lastNak.name,
    tara: taraForDay(birthNakshatraId, lastNakId),
    activities: lastNak.activities,
  })

  return segments
}

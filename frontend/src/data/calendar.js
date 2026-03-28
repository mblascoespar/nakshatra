/**
 * Browser-side calendar builder.
 * Port of backend/services/calendar_service.py::build_year_calendar.
 *
 * Fetches three pre-computed JSON files from /data/, then derives the full
 * year tarabalam calendar entirely in-browser — no backend call.
 */

import { nakshatraById, taraForDay, tithiInfo } from './tarabalam.js'

const BASE = import.meta.env.BASE_URL  // respects vite base config

// Simple in-memory cache so repeated year renders don't re-fetch
const _cache = {}

async function _loadYear(year) {
  if (_cache[year]) return _cache[year]

  const [nkRes, ttRes, snRes] = await Promise.all([
    fetch(`${BASE}data/nakshatra_transitions_${year}.json`),
    fetch(`${BASE}data/tithi_transitions_${year}.json`),
    fetch(`${BASE}data/sunrise_nakshatras_${year}.json`),
  ])

  if (!nkRes.ok) throw new Error(`Failed to load nakshatra transitions for ${year} (HTTP ${nkRes.status})`)
  if (!ttRes.ok) throw new Error(`Failed to load tithi transitions for ${year} (HTTP ${ttRes.status})`)
  if (!snRes.ok) throw new Error(`Failed to load sunrise nakshatras for ${year} (HTTP ${snRes.status})`)

  _cache[year] = {
    nkTransitions: await nkRes.json(),
    ttTransitions: await ttRes.json(),
    sunriseNakshatras: await snRes.json(),
  }
  return _cache[year]
}

/** Format a UTC ISO string to local HH:MM using the given IANA timezone. */
function _utcToLocalTime(utcStr, timezone) {
  const dt = new Date(utcStr.replace('Z', '+00:00'))
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(dt)
}

/** Return "YYYY-MM-DD" for a local calendar date in the given timezone. */
function _localDateString(year, month, day, timezone) {
  // Build an ISO-like string interpreted in the local timezone via Intl
  const dt = new Date(`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T12:00:00`)
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(year, month - 1, day))
}

/** Number of days in a month (handles leap years). */
function _daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/** Day of week for a local date (0=Mon … 6=Sun, matching Python weekday()). */
function _dayOfWeek(year, month, day) {
  const jsDay = new Date(year, month - 1, day).getDay() // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1
}

const MONTH_NAMES = ['','January','February','March','April','May','June',
                     'July','August','September','October','November','December']

/**
 * Build a full-year tarabalam calendar.
 *
 * @param {number} nakshatraId   Birth nakshatra id (1-27)
 * @param {number} year
 * @param {string} timezone      IANA timezone string
 * @param {string} cityLabel     Must match a key in sunrise_nakshatras_{year}.json
 * @returns {Promise<object>}    Same shape as backend YearCalendarResponse
 */
export async function buildYearCalendar(nakshatraId, year, timezone, cityLabel) {
  const { nkTransitions, ttTransitions, sunriseNakshatras } = await _loadYear(year)

  const cityData = sunriseNakshatras[cityLabel]
  if (!cityData) throw new Error(`No sunrise data for city "${cityLabel}" in year ${year}`)

  // Build UTC boundary strings for each local day so we can filter transitions
  // We need local-day start/end in UTC. We do this by converting the local
  // midnight/end-of-day to UTC using Date arithmetic.
  const months = []

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = _daysInMonth(year, month)
    const days = []

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      // Local day boundaries in UTC (same approach as Python: local midnight → UTC)
      const localMidnight  = new Date(`${year}-${String(month).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}T00:00:00`)
      const localEndOfDay  = new Date(`${year}-${String(month).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}T23:59:59`)

      // Convert local wall-clock to UTC by reading what UTC instant corresponds
      // to midnight in this timezone.
      const utcStartMs = _localWallToUTCMs(year, month, dayNum, 0, 0, 0, timezone)
      const utcEndMs   = _localWallToUTCMs(year, month, dayNum, 23, 59, 59, timezone)

      const startStr = _msToUTCStr(utcStartMs)
      const endStr   = _msToUTCStr(utcEndMs)

      const nkToday = nkTransitions.filter((t) => t.utc >= startStr && t.utc <= endStr)
      const ttToday = ttTransitions.filter((t) => t.utc >= startStr && t.utc <= endStr)

      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
      const sunriseNkId = cityData[dateStr] ?? 1
      const tara = taraForDay(nakshatraId, sunriseNkId)
      const sunriseNak = nakshatraById(sunriseNkId)

      days.push({
        date: dateStr,
        day_of_week: _dayOfWeek(year, month, dayNum),
        tarabalam_tier: tara.tier,
        tara: { number: tara.number, name: tara.name, tier: tara.tier, meaning: tara.meaning },
        sunrise_nakshatra_id: sunriseNkId,
        sunrise_nakshatra_name: sunriseNak.name,
        constellation_type: sunriseNak.constellation_type,
        activities: sunriseNak.activities,
        nakshatra_transitions: nkToday.map((t) => ({
          time: _utcToLocalTime(t.utc, timezone),
          nakshatra_id: t.nakshatra_id,
          nakshatra_name: nakshatraById(t.nakshatra_id).name,
        })),
        tithi_transitions: ttToday.map((t) => {
          const info = tithiInfo(t.tithi_index)
          return { time: _utcToLocalTime(t.utc, timezone), tithi_number: info.number, tithi_name: info.name, paksha: info.paksha }
        }),
      })
    }

    months.push({ month, month_name: MONTH_NAMES[month], days })
  }

  const nak = nakshatraById(nakshatraId)
  return { nakshatra: nak, year, timezone, months }
}

/**
 * Return the UTC epoch ms at which the given local wall-clock time occurs in `timezone`.
 *
 * Fix: the previous implementation subtracted the raw hour difference, which gave a
 * 24h error for timezones behind UTC (e.g. Seattle UTC-8: midnight was computed as
 * Jan 3 08:00 UTC instead of Jan 4 08:00 UTC), causing the previous day's nakshatra
 * transitions to bleed into the current day's display.
 *
 * Correct approach: treat the naive UTC time as a probe, read the local time it maps
 * to as a "fake UTC" timestamp, then shift by (naiveMs - localMs) to land on the
 * true UTC instant.
 */
function _localWallToUTCMs(year, month, day, hour, minute, second, timezone) {
  const naiveMs = Date.UTC(year, month - 1, day, hour, minute, second)
  const localMs = _localMsAt(naiveMs, timezone)
  return naiveMs + (naiveMs - localMs)
}

/** Return the local time at utcMs expressed as a "fake UTC" ms value (date parts only, no offset). */
function _localMsAt(utcMs, timezone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(utcMs))
  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10)
  const h = get('hour')
  return Date.UTC(get('year'), get('month') - 1, get('day'), h === 24 ? 0 : h, get('minute'), get('second'))
}

function _msToUTCStr(ms) {
  return new Date(ms).toISOString().replace('.000Z', 'Z').replace(/\.\d{3}Z$/, 'Z')
}

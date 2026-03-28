import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildYearCalendar } from '../data/calendar.js'
import parityFixture from './parity_fixture.json'

// Minimal fixture data for 2026 January (Mumbai) — enough to test the builder
// without loading real JSON files
const MOCK_NK_TRANSITIONS = [
  { utc: '2026-01-01T02:14:33Z', nakshatra_id: 5 },
  { utc: '2026-01-14T18:00:00Z', nakshatra_id: 9 },
]
const MOCK_TT_TRANSITIONS = [
  { utc: '2026-01-03T10:00:00Z', tithi_index: 1 },
]
// Jan 1-5 sunrise nakshatras for Mumbai from parity fixture + hand-computed
const MOCK_SUNRISE = {
  Mumbai: {
    '2026-01-01': 4,
    '2026-01-02': 4,
    '2026-01-03': 5,
    '2026-01-04': 5,
    '2026-01-05': 5,
    '2026-01-06': 6,
    '2026-01-07': 6,
    '2026-01-08': 6,
    '2026-01-09': 7,
    '2026-01-10': 7,
    '2026-01-11': 7,
    '2026-01-12': 8,
    '2026-01-13': 8,
    '2026-01-14': 8,
    '2026-01-15': 9,
    '2026-01-16': 9,
    '2026-01-17': 10,
    '2026-01-18': 10,
    '2026-01-19': 10,
    '2026-01-20': 11,
    '2026-01-21': 11,
    '2026-01-22': 11,
    '2026-01-23': 12,
    '2026-01-24': 12,
    '2026-01-25': 12,
    '2026-01-26': 13,
    '2026-01-27': 13,
    '2026-01-28': 13,
    '2026-01-29': 14,
    '2026-01-30': 14,
    '2026-01-31': 14,
  }
}

describe('buildYearCalendar', () => {
  beforeEach(() => {
    // Clear the module-level cache between tests
    vi.resetModules()
  })

  it('builds a calendar with 12 months', async () => {
    // Provide full 365-day sunrise data by filling missing dates with nakshatra 1
    const fullSunrise = { Mumbai: {} }
    for (let m = 1; m <= 12; m++) {
      const days = new Date(2026, m, 0).getDate()
      for (let d = 1; d <= days; d++) {
        const key = `2026-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
        fullSunrise.Mumbai[key] = MOCK_SUNRISE.Mumbai[key] ?? 1
      }
    }

    global.fetch = vi.fn((url) => {
      if (url.includes('nakshatra_transitions')) return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_NK_TRANSITIONS) })
      if (url.includes('tithi_transitions'))    return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_TT_TRANSITIONS) })
      if (url.includes('sunrise_nakshatras'))   return Promise.resolve({ ok: true, json: () => Promise.resolve(fullSunrise) })
      return Promise.reject(new Error(`Unexpected fetch: ${url}`))
    })

    const cal = await buildYearCalendar(17, 2026, 'Asia/Kolkata', 'Mumbai')

    expect(cal.months).toHaveLength(12)
    expect(cal.year).toBe(2026)
    expect(cal.timezone).toBe('Asia/Kolkata')
    expect(cal.nakshatra.id).toBe(17)
  })

  it('January has 31 days', async () => {
    const fullSunrise = { Mumbai: {} }
    for (let m = 1; m <= 12; m++) {
      const days = new Date(2026, m, 0).getDate()
      for (let d = 1; d <= days; d++) {
        const key = `2026-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
        fullSunrise.Mumbai[key] = 1
      }
    }

    global.fetch = vi.fn((url) => {
      if (url.includes('nakshatra_transitions')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      if (url.includes('tithi_transitions'))    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      if (url.includes('sunrise_nakshatras'))   return Promise.resolve({ ok: true, json: () => Promise.resolve(fullSunrise) })
    })

    const cal = await buildYearCalendar(1, 2026, 'Asia/Kolkata', 'Mumbai')
    expect(cal.months[0].days).toHaveLength(31)
  })

  it('tarabalam tier on Jan 1 matches parity fixture (birth=17, Mumbai, sunrise nk=4)', async () => {
    // parity fixture says Mumbai 2026-01-01 sunrise nakshatra = 4
    // taraForDay(17, 4): count = ((4-17)%27+27)%27+1 = ((-13%27)+27)%27+1 = 14+1=15
    //                    taraNumber = ((15-1)%9)+1 = (14%9)+1 = 5+1 = 6 → Sadhana, very_good
    const fullSunrise = { Mumbai: {} }
    for (let m = 1; m <= 12; m++) {
      const days = new Date(2026, m, 0).getDate()
      for (let d = 1; d <= days; d++) {
        const key = `2026-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
        fullSunrise.Mumbai[key] = parityFixture.Mumbai[key] ?? 1
      }
    }

    global.fetch = vi.fn((url) => {
      if (url.includes('nakshatra_transitions')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      if (url.includes('tithi_transitions'))    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      if (url.includes('sunrise_nakshatras'))   return Promise.resolve({ ok: true, json: () => Promise.resolve(fullSunrise) })
    })

    const cal = await buildYearCalendar(17, 2026, 'Asia/Kolkata', 'Mumbai')
    const jan1 = cal.months[0].days[0]
    expect(jan1.date).toBe('2026-01-01')
    expect(jan1.sunrise_nakshatra_id).toBe(4)
    expect(jan1.tara.number).toBe(6)
    expect(jan1.tara.name).toBe('Sadhana')
    expect(jan1.tarabalam_tier).toBe('very_good')
  })

  it('throws a descriptive error when fetch fails', async () => {
    // Use year 2099 to avoid cache collision with other tests
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }))
    await expect(buildYearCalendar(1, 2099, 'Asia/Kolkata', 'Mumbai'))
      .rejects.toThrow('2099')
  })

  it('throws a descriptive error for unknown city', async () => {
    // Use year 2098 to avoid cache collision with other tests
    global.fetch = vi.fn((url) => {
      if (url.includes('nakshatra_transitions')) return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      if (url.includes('tithi_transitions'))    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      if (url.includes('sunrise_nakshatras'))   return Promise.resolve({ ok: true, json: () => Promise.resolve({ Mumbai: {} }) })
    })
    await expect(buildYearCalendar(1, 2098, 'Asia/Kolkata', 'NotACity'))
      .rejects.toThrow('NotACity')
  })
})

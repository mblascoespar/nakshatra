import { create } from 'zustand'
import { detectTimezone } from '../utils/timezone'

const currentYear = new Date().getFullYear()

const useCalendarStore = create((set) => ({
  selectedNakshatra: null,   // full NakshatraMeta object from API
  year: currentYear,
  timezone: detectTimezone(),
  lat: 19.08,                // Default: Mumbai
  lon: 72.88,
  locationLabel: 'Mumbai',   // Human-readable city name for PDF subtitle
  calendarData: null,
  loading: false,
  error: null,

  setNakshatra: (nakshatra) => set({ selectedNakshatra: nakshatra }),
  setYear: (year) => set({ year }),
  setTimezone: (timezone) => set({ timezone }),
  setLocation: (lat, lon, tz, label) => set({ lat, lon, timezone: tz, locationLabel: label }),
  setCalendarData: (data) => set({ calendarData: data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export default useCalendarStore

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { detectTimezone } from '../utils/timezone'

const currentYear = new Date().getFullYear()

const useCalendarStore = create(
  persist(
    (set) => ({
      selectedNakshatra: null,   // full NakshatraMeta object from API
      year: currentYear,
      timezone: detectTimezone(),
      lat: null,
      lon: null,
      locationLabel: null,
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
    }),
    {
      name: 'nakshatra-calendar-storage',
      partialize: (state) => ({
        selectedNakshatra: state.selectedNakshatra,
        lat: state.lat,
        lon: state.lon,
        timezone: state.timezone,
        locationLabel: state.locationLabel,
      }),
    }
  )
)

export default useCalendarStore

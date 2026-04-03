import { useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import { NAKSHATRAS } from './data/tarabalam'
import { buildYearCalendar } from './data/calendar'
import NakshatraSelector from './components/NakshatraSelector'
import LocationSelector from './components/LocationSelector'
import YearCalendar from './components/YearCalendar'
import useCalendarStore from './store/useCalendarStore'

const AVAILABLE_YEARS = [2026, 2027, 2028, 2029, 2030]

export default function App() {
  const {
    selectedNakshatra,
    year, setYear,
    timezone,
    locationLabel,
    calendarData, setCalendarData,
    loading, setLoading,
    error, setError,
  } = useCalendarStore()

  // Re-build whenever nakshatra, year, timezone, or location changes
  useEffect(() => {
    if (!selectedNakshatra) return
    setLoading(true)
    setError(null)
    const start = performance.now()
    buildYearCalendar(selectedNakshatra.id, year, timezone, locationLabel)
      .then((data) => {
        setCalendarData(data)
        console.log(`Calendar painted in ${Math.round(performance.now() - start)}ms`)
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to load calendar')
      })
      .finally(() => setLoading(false))
  }, [selectedNakshatra, year, timezone, locationLabel])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 shadow">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Nakshatra Tarabalam Calendar</h1>
            <p className="text-xs text-gray-400 mt-0.5">Vedic auspicious timing for practitioners</p>
          </div>
          <div className="flex items-center gap-3">
            <LocationSelector />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={() => signOut(auth)}
              className="bg-gray-700 hover:bg-gray-600 text-white text-xs rounded px-3 py-1 border border-gray-600 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Client Birth Nakshatra</h2>
          <NakshatraSelector nakshatras={NAKSHATRAS} />
        </section>

        {!selectedNakshatra && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Select a Nakshatra above to generate the calendar</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-20 text-gray-400">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p>Computing Tarabalam calendar...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && calendarData && (
          <YearCalendar calendarData={calendarData} />
        )}
      </main>
    </div>
  )
}

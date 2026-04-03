import { useState, useRef, useEffect, useCallback } from 'react'
import useCalendarStore from '../store/useCalendarStore'

function utcOffset(tz) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  }).formatToParts(new Date())
  return (parts.find((p) => p.type === 'timeZoneName')?.value ?? '').replace('GMT', 'UTC')
}

export default function LocationSelector() {
  const { lat, lon, timezone, locationLabel, setLocation } = useCalendarStore()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [manualMode, setManualMode] = useState(false)
  const [manualFields, setManualFields] = useState({ lat: '', lon: '', tz: '', label: '' })

  const debounceRef = useRef(null)
  const panelRef = useRef(null)
  const inputRef = useRef(null)

  // Search Nominatim
  const searchNominatim = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setSelectedIdx(-1)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.set('q', q)
      url.searchParams.set('format', 'json')
      url.searchParams.set('limit', '8')
      url.searchParams.set('addressdetails', '1')
      url.searchParams.set('accept-language', 'en')

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'nakshatra-app/1.0' }
      })

      if (!response.ok) throw new Error('Search unavailable')
      const results = await response.json()

      setSuggestions(results.map(r => {
        const addr = r.address || {}
        const shortName = addr.city || addr.town || addr.village || addr.county || addr.state || addr.province || r.name
        return {
          display: r.display_name,
          shortName,
          country: addr.country || '',
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
        }
      }))
      setSelectedIdx(-1)
    } catch (e) {
      setError('Search unavailable, try manual entry')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchNominatim(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, searchNominatim])

  // Fetch timezone for a coordinate
  const fetchTimezone = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`
      )
      if (!response.ok) throw new Error('Could not fetch timezone')
      const data = await response.json()
      return data.timeZone
    } catch {
      setError('Could not detect timezone — enter manually')
      return null
    }
  }

  // Select a suggestion
  const handleSelectSuggestion = async (suggestion) => {
    setLoading(true)
    try {
      const tz = await fetchTimezone(suggestion.lat, suggestion.lon)
      if (!tz) {
        setLoading(false)
        return
      }

      const label = `${suggestion.shortName}, ${suggestion.country}`
      setLocation(suggestion.lat, suggestion.lon, tz, label)

      setOpen(false)
      setQuery('')
      setSuggestions([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  // Manual entry
  const handleManualSave = () => {
    const lat = parseFloat(manualFields.lat)
    const lon = parseFloat(manualFields.lon)
    const tz = manualFields.tz.trim()
    const label = manualFields.label.trim() || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setError('Invalid coordinates (lat: -90 to 90, lon: -180 to 180)')
      return
    }
    if (!tz) {
      setError('Timezone required (e.g., Asia/Tokyo)')
      return
    }

    setLocation(lat, lon, tz, label)
    setOpen(false)
    setManualMode(false)
    setManualFields({ lat: '', lon: '', tz: '', label: '' })
    setError(null)
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open) return

    if (e.key === 'Escape') {
      setOpen(false)
      setSelectedIdx(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => (i + 1) % (suggestions.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => (i <= 0 ? (suggestions.length || 1) - 1 : i - 1))
    } else if (e.key === 'Enter' && selectedIdx >= 0 && suggestions[selectedIdx]) {
      e.preventDefault()
      handleSelectSuggestion(suggestions[selectedIdx])
    }
  }

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="flex items-center gap-2 relative">
      <label className="text-xs text-gray-400 whitespace-nowrap">Location</label>

      <div className="relative w-48">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 text-left truncate hover:bg-gray-600"
          >
            {locationLabel} ({utcOffset(timezone)})
          </button>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder="Search city..."
            className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        )}

        {/* Dropdown panel */}
        {open && (
          <div
            ref={panelRef}
            className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-600 rounded shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {!manualMode ? (
              <>
                {loading && (
                  <div className="px-2 py-2 text-xs text-gray-400">
                    Searching...
                  </div>
                )}

                {error && (
                  <div className="px-2 py-2 text-xs text-red-400">
                    {error}
                    <button
                      onClick={() => setManualMode(true)}
                      className="ml-2 underline hover:text-red-300"
                    >
                      Enter manually
                    </button>
                  </div>
                )}

                {suggestions.length === 0 && !loading && !error && query.length >= 2 && (
                  <div className="px-2 py-2 text-xs text-gray-400">
                    No results found
                    <button
                      onClick={() => setManualMode(true)}
                      className="ml-2 underline hover:text-gray-300"
                    >
                      Enter manually
                    </button>
                  </div>
                )}

                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSuggestion(s)}
                    className={`w-full text-left px-2 py-1 text-xs ${
                      selectedIdx === i
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="truncate">{s.display}</div>
                  </button>
                ))}

                {query.length >= 2 && (
                  <button
                    onClick={() => setManualMode(true)}
                    className="w-full text-left px-2 py-1 text-xs text-gray-400 border-t border-gray-700 hover:bg-gray-700 hover:text-gray-300"
                  >
                    ✎ Enter manually
                  </button>
                )}
              </>
            ) : (
              /* Manual entry form */
              <div className="p-3 space-y-2">
                <div>
                  <label className="text-xs text-gray-400">Latitude (-90 to 90)</label>
                  <input
                    type="number"
                    value={manualFields.lat}
                    onChange={(e) => setManualFields({...manualFields, lat: e.target.value})}
                    placeholder="e.g. 35.68"
                    className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Longitude (-180 to 180)</label>
                  <input
                    type="number"
                    value={manualFields.lon}
                    onChange={(e) => setManualFields({...manualFields, lon: e.target.value})}
                    placeholder="e.g. 139.69"
                    className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Timezone (IANA)</label>
                  <input
                    type="text"
                    value={manualFields.tz}
                    onChange={(e) => setManualFields({...manualFields, tz: e.target.value})}
                    placeholder="e.g. Asia/Tokyo"
                    className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Label (optional)</label>
                  <input
                    type="text"
                    value={manualFields.label}
                    onChange={(e) => setManualFields({...manualFields, label: e.target.value})}
                    placeholder="e.g. My City"
                    className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
                  />
                </div>

                {error && <div className="text-xs text-red-400">{error}</div>}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleManualSave}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded px-2 py-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setManualMode(false)
                      setManualFields({lat: '', lon: '', tz: '', label: ''})
                      setError(null)
                      setQuery('')
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded px-2 py-1"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

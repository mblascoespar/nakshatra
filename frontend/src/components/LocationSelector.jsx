import { LOCATIONS, ALL_CITIES } from '../data/locations'
import useCalendarStore from '../store/useCalendarStore'

function utcOffset(tz) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: tz,
    timeZoneName: 'shortOffset',
  }).formatToParts(new Date())
  return (parts.find((p) => p.type === 'timeZoneName')?.value ?? '').replace('GMT', 'UTC')
}

function cityKey(city) {
  return `${city.lat},${city.lon}`
}

export default function LocationSelector() {
  const { lat, lon, setLocation } = useCalendarStore()
  const currentKey = `${lat},${lon}`

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 whitespace-nowrap">Location</label>
      <select
        value={currentKey}
        onChange={(e) => {
          const city = ALL_CITIES.find((c) => cityKey(c) === e.target.value)
          if (city) setLocation(city.lat, city.lon, city.tz, city.label)
        }}
        className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 max-w-[200px]"
      >
        {LOCATIONS.map(({ group, cities }) => (
          <optgroup key={group} label={group}>
            {cities.map((city) => (
              <option key={cityKey(city)} value={cityKey(city)}>
                {city.label} ({utcOffset(city.tz)})
              </option>
            ))}
          </optgroup>
        ))}
        {/* Keep the current selection visible even if not in the curated list */}
        {!ALL_CITIES.some((c) => cityKey(c) === currentKey) && (
          <optgroup label="Current">
            <option value={currentKey}>{lat.toFixed(2)}°, {lon.toFixed(2)}°</option>
          </optgroup>
        )}
      </select>
    </div>
  )
}

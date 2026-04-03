import { useState, useCallback } from 'react'
import { searchActivities, getActivitiesByCategory } from '../../data/activityIndex'

export default function ActivitySearchInput({
  value,
  onChange,
  onSelect,
  selectedCategory,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleChange = useCallback(
    (e) => {
      const query = e.target.value
      onChange(query)

      if (query.length === 0) {
        setSuggestions([])
        return
      }

      // Search activities
      let results = searchActivities(query)

      // Filter by category if selected
      if (selectedCategory) {
        const categoryActivities = getActivitiesByCategory()[selectedCategory]
        const categoryIds = categoryActivities.map((a) => a.id)
        results = results.filter((a) => categoryIds.includes(a.id))
      }

      setSuggestions(results.slice(0, 5))
      setShowSuggestions(true)
    },
    [onChange, selectedCategory]
  )

  const handleSelect = (activity) => {
    onSelect(activity)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Search activity:
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={() => value && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
          {suggestions.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleSelect(activity)}
              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
            >
              <div className="font-medium text-sm">{activity.displayText}</div>
              <div className="text-xs text-gray-500">{activity.category}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

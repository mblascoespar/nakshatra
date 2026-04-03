import { useState, useCallback, useMemo } from 'react'
import ActivitySearchInput from './ActivitySearchInput'
import CategoryFilter from './CategoryFilter'
import DateRangePicker from './DateRangePicker'
import ResultsList from './ResultsList'
import { performActivitySearch, getActivitiesByIds } from '../../utils/activitySearchUtils'
import { ACTIVITY_CATEGORIES } from '../../data/activityIndex'

export default function ActivitySearchModal({
  calendarData,
  onClose,
  onSelectDay,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().setDate(new Date().getDate()))
  )
  const [dateTo, setDateTo] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  )
  const [searchResults, setSearchResults] = useState([])
  const [resultsExpanded, setResultsExpanded] = useState(false)

  const handleSearch = useCallback(() => {
    if (!selectedActivity) return

    const results = performActivitySearch(
      selectedActivity,
      calendarData,
      dateFrom,
      dateTo
    )
    setSearchResults(results)
    setResultsExpanded(false)
  }, [selectedActivity, calendarData, dateFrom, dateTo])

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity)
    setSearchQuery(activity.displayText)
    setSearchResults([])
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(
      selectedCategory === category ? null : category
    )
    setSelectedActivity(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleDateChange = (from, to) => {
    setDateFrom(from)
    setDateTo(to)
  }

  const handleClear = () => {
    setSearchQuery('')
    setSelectedActivity(null)
    setSelectedCategory(null)
    setSearchResults([])
    setResultsExpanded(false)
  }

  // Get activities in the selected category
  const activitiesInCategory = useMemo(() => {
    if (!selectedCategory) return []
    const categoryActivityIds = ACTIVITY_CATEGORIES[selectedCategory]
    return getActivitiesByIds(categoryActivityIds)
  }, [selectedCategory])

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Activity Search</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Search Input */}
          <ActivitySearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={handleActivitySelect}
            selectedCategory={selectedCategory}
            placeholder="Type activity name (e.g., marriage, business)..."
          />

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 border-t"></div>
          </div>

          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />

          {/* Activities in Selected Category */}
          {selectedCategory && activitiesInCategory.length > 0 && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Activities in "{selectedCategory}":
              </p>
              <div className="flex flex-wrap gap-2">
                {activitiesInCategory.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleActivitySelect(activity)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      selectedActivity?.id === activity.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-100'
                    }`}
                  >
                    {activity.displayText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateChange}
          />

          {/* Search Button */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
            >
              Clear
            </button>
            <button
              onClick={handleSearch}
              disabled={!selectedActivity}
              className={`px-4 py-2 rounded-lg font-medium text-white ${
                selectedActivity
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        {selectedActivity && (
          <div className="border-t p-6">
            <ResultsList
              results={searchResults}
              activity={selectedActivity}
              expanded={resultsExpanded}
              onToggleExpanded={() => setResultsExpanded(!resultsExpanded)}
              onSelectDay={(day) => {
                onSelectDay(day)
                onClose()
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

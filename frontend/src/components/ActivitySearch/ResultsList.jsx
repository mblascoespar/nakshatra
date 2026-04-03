const TIER_COLORS = {
  very_good: 'bg-green-50 border-green-500',
  good: 'bg-lime-50 border-lime-500',
}

const TIER_LABELS = {
  very_good: '✓ Very Good',
  good: '✓ Good',
}

export default function ResultsList({
  results,
  activity,
  expanded,
  onToggleExpanded,
  onSelectDay,
}) {
  if (!activity) {
    return (
      <div className="text-gray-500 text-sm py-4">
        Search or select an activity to see results.
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4">
        No auspicious days found for <strong>{activity.displayText}</strong> in this range.
      </div>
    )
  }

  const displayedResults = expanded ? results : results.slice(0, 3)

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-700">
        Results: "{activity.displayText}" ({results.length} auspicious days found)
      </p>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displayedResults.map((day) => {
          const dateObj = new Date(day.date)
          const dateStr = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })

          return (
            <div
              key={day.date}
              onClick={() => onSelectDay(day)}
              className={`p-3 rounded-lg cursor-pointer border-l-4 transition hover:shadow-md ${TIER_COLORS[day.tarabalam_tier]}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{dateStr}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {day.sunrise_nakshatra_name}, Tara {day.tara.number} ({day.tara.name})
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white">
                  {TIER_LABELS[day.tarabalam_tier]}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {results.length > 3 && (
        <button
          onClick={onToggleExpanded}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {expanded ? 'Show less' : `Show ${results.length - 3} more`}
        </button>
      )}
    </div>
  )
}

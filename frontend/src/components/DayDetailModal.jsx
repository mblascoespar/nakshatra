const TIER_STYLES = {
  very_good: { badge: 'bg-green-100 text-green-900',   border: 'border-green-500',  label: 'Very Good' },
  good:      { badge: 'bg-green-50  text-green-800',   border: 'border-green-300',  label: 'Good' },
  mixed:     { badge: 'bg-yellow-100 text-yellow-900', border: 'border-yellow-400', label: 'Mixed' },
  poor:      { badge: 'bg-pink-100  text-pink-900',    border: 'border-pink-400',   label: 'Poor' },
  very_bad:  { badge: 'bg-red-100   text-red-900',     border: 'border-red-500',    label: 'Very Bad' },
}

export default function DayDetailModal({ day, onClose }) {
  if (!day) return null

  const styles = TIER_STYLES[day.tarabalam_tier]
  const dateObj = new Date(day.date + 'T12:00:00')
  const dateLabel = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full max-w-md border-t-4 ${styles.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <p className="text-sm text-gray-500">{dateLabel}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${styles.badge}`}>
                {styles.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Nakshatra for the day */}
          <div className="rounded-lg p-3 bg-indigo-50 border border-indigo-200">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">Day's Nakshatra</p>
            <p className="font-semibold text-sm text-indigo-900">{day.sunrise_nakshatra_name}</p>
            <p className="text-xs mt-0.5 opacity-70">
              Constellation: {day.constellation_type}
            </p>
          </div>

          {/* Tara detail */}
          <div className={`rounded-lg p-3 ${styles.badge} bg-opacity-40`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">Tara Rating (Relative to Your Birth Nakshatra)</p>
            <p className="font-semibold text-sm">Tara {day.tara.number}: {day.tara.name}</p>
            <p className="text-xs mt-0.5 opacity-80">{day.tara.meaning}</p>
          </div>

          {/* Auspicious activities */}
          {day.activities && day.activities.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Auspicious Activities
                <span className="ml-2 normal-case font-normal text-gray-400">
                  ({day.constellation_type})
                </span>
              </p>
              <ul className="space-y-0.5">
                {day.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nakshatra transitions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Nakshatra Transitions
            </p>
            {day.nakshatra_transitions.length === 0 ? (
              <p className="text-xs text-gray-400">No transitions today</p>
            ) : (
              <div className="space-y-1">
                {day.nakshatra_transitions.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-gray-500 text-xs w-10">{t.time}</span>
                    <span className="text-gray-800">{t.nakshatra_name}</span>
                    <span className="text-gray-400 text-xs">enters</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tithi transitions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Tithi Transitions
            </p>
            {day.tithi_transitions.length === 0 ? (
              <p className="text-xs text-gray-400">No transitions today</p>
            ) : (
              <div className="space-y-1">
                {day.tithi_transitions.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-gray-500 text-xs w-10">{t.time}</span>
                    <span className="text-gray-800">{t.paksha} {t.tithi_name}</span>
                    <span className="text-gray-400 text-xs">begins</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

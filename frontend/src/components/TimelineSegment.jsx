import { TARAS } from '../data/tarabalam'

const TIER_COLORS = {
  very_good: 'bg-green-50 border-l-4 border-green-500',
  good:      'bg-lime-50 border-l-4 border-lime-400',
  mixed:     'bg-yellow-50 border-l-4 border-yellow-400',
  poor:      'bg-pink-50 border-l-4 border-pink-400',
  very_bad:  'bg-red-50 border-l-4 border-red-500',
}

const TIER_BADGES = {
  very_good: 'bg-green-100 text-green-900',
  good:      'bg-lime-100 text-lime-900',
  mixed:     'bg-yellow-100 text-yellow-900',
  poor:      'bg-pink-100 text-pink-900',
  very_bad:  'bg-red-100 text-red-900',
}

const TIER_LABELS = {
  very_good: 'Very Good',
  good:      'Good',
  mixed:     'Mixed',
  poor:      'Poor',
  very_bad:  'Very Bad',
}

export default function TimelineSegment({ segment, activities }) {
  const tier = TARAS[segment.tara.number].tier
  const tara = TARAS[segment.tara.number]

  return (
    <div className={`p-4 rounded-lg mb-3 ${TIER_COLORS[tier]}`}>
      {/* Nakshatra on left, Time range on right */}
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">
          {segment.nakshatra_name}
        </p>
        <p className="font-mono text-sm text-gray-700">
          {segment.startTime} – {segment.endTime}
        </p>
      </div>

      {/* Quality badge */}
      <div className="mb-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded ${TIER_BADGES[tier]}`}>
          {TIER_LABELS[tier]}
        </span>
      </div>

      {/* Activity hints or warning */}
      {(tier === 'very_bad' || tier === 'poor') ? (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-sm font-semibold text-red-700">
            ⚠️ Avoid any activity
          </p>
        </div>
      ) : tier === 'mixed' ? (
        // No activity hints for mixed
        null
      ) : (
        // Show activity hints for very_good and good
        activities && activities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-20">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              {tier === 'very_good' ? 'Best for:' : 'Good for:'}
            </p>
            <ul className="space-y-1">
              {activities.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-500 text-xs mt-0.5">•</span>
                  <span className="text-sm text-gray-800">{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  )
}

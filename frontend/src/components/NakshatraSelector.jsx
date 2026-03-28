import { useState } from 'react'
import useCalendarStore from '../store/useCalendarStore'

// Grouped by ruling planet for easier visual scanning
const PLANET_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
const PLANET_COLORS = {
  Ketu:    'bg-orange-50 border-orange-200',
  Venus:   'bg-pink-50 border-pink-200',
  Sun:     'bg-amber-50 border-amber-200',
  Moon:    'bg-blue-50 border-blue-200',
  Mars:    'bg-red-50 border-red-200',
  Rahu:    'bg-purple-50 border-purple-200',
  Jupiter: 'bg-yellow-50 border-yellow-200',
  Saturn:  'bg-slate-50 border-slate-200',
  Mercury: 'bg-green-50 border-green-200',
}

export default function NakshatraSelector({ nakshatras }) {
  const { selectedNakshatra, setNakshatra } = useCalendarStore()
  const [tooltip, setTooltip] = useState(null)

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">Select the client's birth Nakshatra</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
        {[...nakshatras].sort((a, b) => a.name.localeCompare(b.name)).map((nak) => {
          const isSelected = selectedNakshatra?.id === nak.id
          const colorClass = PLANET_COLORS[nak.ruler] ?? 'bg-gray-50 border-gray-200'
          return (
            <div key={nak.id} className="relative">
              <button
                onClick={() => setNakshatra(nak)}
                onMouseEnter={() => setTooltip(nak)}
                onMouseLeave={() => setTooltip(null)}
                className={`
                  w-full text-left px-2 py-1.5 rounded border text-xs font-medium
                  transition-all duration-100
                  ${isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-400 bg-indigo-50 text-indigo-800'
                    : `${colorClass} hover:brightness-95 text-gray-700`
                  }
                `}
              >
                <span className="block truncate">{nak.name}</span>
                <span className="block text-[10px] text-gray-400 font-normal">{nak.ruler}</span>
              </button>

              {tooltip?.id === nak.id && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 text-xs pointer-events-none">
                  <p className="font-semibold text-gray-800">{nak.name}</p>
                  <p className="text-gray-500">Ruler: {nak.ruler} · Deity: {nak.deity}</p>
                  <p className="text-gray-600 mt-1">{nak.qualities}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

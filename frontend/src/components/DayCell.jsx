const TIER_BG = {
  very_good: 'bg-green-400  border-green-500  hover:bg-green-500',
  good:      'bg-green-100  border-green-300  hover:bg-green-200',
  mixed:     'bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
  poor:      'bg-pink-100   border-pink-300   hover:bg-pink-200',
  very_bad:  'bg-red-400    border-red-500    hover:bg-red-500',
}

const TIER_DAY_NUM = {
  very_good: 'text-green-950',
  good:      'text-green-800',
  mixed:     'text-yellow-900',
  poor:      'text-pink-900',
  very_bad:  'text-red-950',
}

// Abbreviate long Nakshatra names to fit in compact cells
function abbrev(name) {
  const map = {
    'Purva Phalguni':    'P.Phalguni',
    'Uttara Phalguni':   'U.Phalguni',
    'Moola':             'Moola',
    'Purva Ashadha':     'P.Ashadha',
    'Uttara Ashadha':    'U.Ashadha',
    'Purva Bhadrapada':  'P.Bhadra',
    'Uttara Bhadrapada': 'U.Bhadra',
    'Parama Mitra':      'Par.Mitra',
  }
  return map[name] ?? name
}

export default function DayCell({ day, onClick }) {
  const dayNum = parseInt(day.date.split('-')[2], 10)
  const bg = TIER_BG[day.tarabalam_tier]
  const numColor = TIER_DAY_NUM[day.tarabalam_tier]

  return (
    <button
      onClick={() => onClick(day)}
      className={`
        w-full min-h-[4.5rem] text-left p-1 rounded border text-[10px] leading-tight
        transition-colors cursor-pointer ${bg}
      `}
    >
      <span className={`block font-bold text-xs mb-0.5 ${numColor}`}>{dayNum}</span>
      <span className="block font-semibold truncate">{abbrev(day.sunrise_nakshatra_name)}</span>

      {day.nakshatra_transitions.map((t, i) => (
        <span key={i} className="block text-indigo-700 truncate">
          {abbrev(t.nakshatra_name)}
        </span>
      ))}
    </button>
  )
}

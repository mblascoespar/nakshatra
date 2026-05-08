const TIER_RGB = {
  very_good: 'rgb(46,160,67)',
  good:      'rgb(140,210,150)',
  mixed:     'rgb(255,232,110)',
  poor:      'rgb(255,170,170)',
  very_bad:  'rgb(220,75,75)',
}

const TIER_BORDER = {
  very_good: 'border-green-500',
  good:      'border-green-300',
  mixed:     'border-yellow-300',
  poor:      'border-pink-300',
  very_bad:  'border-red-500',
}

const TIER_DAY_NUM = {
  very_good: 'text-green-950',
  good:      'text-green-800',
  mixed:     'text-yellow-900',
  poor:      'text-pink-900',
  very_bad:  'text-red-950',
}

function buildBackground(day) {
  const baseTier = day.midnight_tarabalam_tier ?? day.tarabalam_tier
  const segs = [{ tier: baseTier }]
  for (const t of day.nakshatra_transitions) {
    const [h, m] = t.time.split(':').map(Number)
    segs.push({ rawFrac: (h * 60 + m) / 1440, tier: t.tier })
  }

  const sizes = segs.map((s, i) => {
    const start = s.rawFrac ?? 0
    const end   = i + 1 < segs.length ? (segs[i + 1].rawFrac ?? 1) : 1
    return Math.max(0, end - start)
  })

  if (segs.length === 1) return TIER_RGB[segs[0].tier]

  const stops = []
  let cursor = 0
  for (let i = 0; i < segs.length; i++) {
    const color = TIER_RGB[segs[i].tier]
    const startPct = (cursor * 100).toFixed(1)
    cursor += sizes[i]
    const endPct = (cursor * 100).toFixed(1)
    stops.push(`${color} ${startPct}%`, `${color} ${endPct}%`)
  }

  return `linear-gradient(to bottom, ${stops.join(', ')})`
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
  const numColor = TIER_DAY_NUM[day.tarabalam_tier]
  const border = TIER_BORDER[day.tarabalam_tier]

  return (
    <button
      onClick={() => onClick(day)}
      style={{ background: buildBackground(day) }}
      className={`
        w-full min-h-[4.5rem] text-left p-1 rounded border text-[10px] leading-tight
        cursor-pointer hover:brightness-95 transition-[filter] ${border}
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

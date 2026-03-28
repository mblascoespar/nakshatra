import DayCell from './DayCell'

const DOW_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthGrid({ monthData, onDayClick }) {
  // day_of_week: 0=Monday, 6=Sunday — matches Python's weekday()
  const firstDow = monthData.days[0]?.day_of_week ?? 0
  const blanks = Array(firstDow).fill(null)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-800 text-white text-sm font-semibold px-3 py-2">
        {monthData.month_name}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DOW_HEADERS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 p-px">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="bg-white min-h-[4.5rem]" />
        ))}
        {monthData.days.map((day) => (
          <div key={day.date} className="bg-white">
            <DayCell day={day} onClick={onDayClick} />
          </div>
        ))}
      </div>
    </div>
  )
}

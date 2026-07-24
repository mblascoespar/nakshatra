import { useEffect, useRef, useState } from 'react'
import MonthGrid from './MonthGrid'
import DayDetailModal from './DayDetailModal'
import ActivitySearchButton from './ActivitySearch/ActivitySearchButton'
import ActivitySearchModal from './ActivitySearch/ActivitySearchModal'
import useCalendarStore from '../store/useCalendarStore'
import { generatePdf } from '../utils/generatePdf'

const BUCKET_LEGEND = [
  { bucket: 'very_good', label: 'Very Good', color: 'bg-green-400 border-green-500' },
  { bucket: 'good',      label: 'Good',      color: 'bg-green-100 border-green-300' },
  { bucket: 'mixed',     label: 'Mixed',     color: 'bg-yellow-100 border-yellow-300' },
  { bucket: 'poor',      label: 'Poor',      color: 'bg-pink-100 border-pink-300' },
  { bucket: 'very_bad',  label: 'Unsupportive',  color: 'bg-red-400 border-red-500' },
]

export default function YearCalendar({ calendarData }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [activitySearchOpen, setActivitySearchOpen] = useState(false)
  const { locationLabel } = useCalendarStore()
  const currentMonthRef = useRef(null)

  useEffect(() => {
    const now = new Date()
    if (calendarData.year === now.getFullYear() && currentMonthRef.current) {
      currentMonthRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [calendarData.year])

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      await generatePdf(calendarData, locationLabel)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {calendarData.year} — {calendarData.nakshatra.name} Nakshatra
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Ruler: {calendarData.nakshatra.ruler} · Deity: {calendarData.nakshatra.deity} · {calendarData.timezone}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex gap-2">
            {BUCKET_LEGEND.map(({ bucket, label, color }) => (
              <span key={bucket} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border ${color}`}>
                {label}
              </span>
            ))}
          </div>

          {/* Activity Search */}
          <ActivitySearchButton onClick={() => setActivitySearchOpen(true)} />

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Colour key */}
      <div className="flex flex-wrap gap-4 mb-5 text-[11px] text-gray-500 items-center">
        <span><span className="text-indigo-700 font-medium">Indigo</span> = Nakshatra transition</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgb(200,90,0)', color: 'rgb(255,240,180)' }}>Yugadi</span>
          = Self-auspicious day
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgb(210,215,230)', color: 'rgb(20,20,40)' }}>Purnima</span>
          = Full Moon
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgb(35,35,55)', color: 'rgb(190,195,215)' }}>Amavasya</span>
          = New Moon
        </span>
      </div>

      {/* 12-month grid — 3 columns on xl, 2 on md, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {calendarData.months.map((month) => (
          <div
            key={month.month}
            ref={month.month === new Date().getMonth() + 1 ? currentMonthRef : null}
          >
            <MonthGrid
              monthData={month}
              onDayClick={setSelectedDay}
            />
          </div>
        ))}
      </div>

      <DayDetailModal
        day={selectedDay}
        birthNakshatraId={calendarData.nakshatra.id}
        onClose={() => setSelectedDay(null)}
      />

      {activitySearchOpen && (
        <ActivitySearchModal
          calendarData={calendarData}
          onClose={() => setActivitySearchOpen(false)}
          onSelectDay={(day) => {
            setSelectedDay(day)
            setActivitySearchOpen(false)
          }}
        />
      )}
    </div>
  )
}

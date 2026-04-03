import TimelineSegments from './TimelineSegments'

export default function DayDetailModal({ day, birthNakshatraId, onClose }) {
  if (!day) return null

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3 border-b">
          <p className="text-sm text-gray-500">{dateLabel}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-5 py-5 overflow-y-auto flex-1">
          {/* Timeline Segments */}
          <TimelineSegments day={day} birthNakshatraId={birthNakshatraId} />
        </div>
      </div>
    </div>
  )
}

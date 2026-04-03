import TimelineSegment from './TimelineSegment'
import { buildTimelineSegments } from '../utils/timelineUtils'

export default function TimelineSegments({ day, birthNakshatraId }) {
  const segments = buildTimelineSegments(day, birthNakshatraId)

  return (
    <div className="space-y-2">
      {segments.map((segment, i) => (
        <TimelineSegment
          key={i}
          segment={segment}
          activities={segment.activities}
        />
      ))}
    </div>
  )
}

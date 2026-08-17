import { useState } from 'react'

export default function LocationBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-indigo-600 text-white px-6 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <p className="text-sm font-medium min-w-0 flex-1">
          Set a location using the <span className="font-bold">Location</span> field in the header to generate the calendar.
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 text-indigo-200 hover:text-white text-xl leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  )
}

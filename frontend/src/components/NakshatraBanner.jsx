import { useState } from 'react'

export default function NakshatraBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-indigo-600 text-white px-6 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <p className="text-sm font-medium min-w-0 flex-1">
          Don't know your birth Nakshatra? Find it with the{' '}
          <a
            href="https://www.prokerala.com/astrology/nakshatra-finder/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:text-indigo-100"
          >
            Prokerala Nakshatra Finder
          </a>
          , then select it in the Client Birth Nakshatra section below to generate the calendar.
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

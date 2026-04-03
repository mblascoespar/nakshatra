export default function DateRangePicker({ dateFrom, dateTo, onChange }) {
  const handleFromChange = (e) => {
    onChange(new Date(e.target.value), dateTo)
  }

  const handleToChange = (e) => {
    onChange(dateFrom, new Date(e.target.value))
  }

  const fromString = dateFrom.toISOString().split('T')[0]
  const toString = dateTo.toISOString().split('T')[0]

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Date range:
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-600 block mb-1">From:</label>
          <input
            type="date"
            value={fromString}
            onChange={handleFromChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block mb-1">To:</label>
          <input
            type="date"
            value={toString}
            onChange={handleToChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}

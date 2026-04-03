export default function ActivitySearchButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 font-medium transition"
    >
      <span>🔍</span>
      <span>Activity Search</span>
    </button>
  )
}

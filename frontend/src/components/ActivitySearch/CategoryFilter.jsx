import { ACTIVITY_CATEGORIES } from '../../data/activityIndex'

export default function CategoryFilter({ selectedCategory, onSelect }) {
  const categories = Object.keys(ACTIVITY_CATEGORIES)

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Or browse by category:
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

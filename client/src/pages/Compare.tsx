import { Link } from 'react-router-dom';
import { ComparisonPanel } from '../components/ComparisonPanel';
import { useComparison } from '../hooks/useComparison';

/**
 * Compare page — shows the ComparisonPanel for 1-2 pinned neighborhoods,
 * or an empty state with a link back to home.
 */
export function Compare() {
  const { pinned, clearComparison } = useComparison();

  if (pinned.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-6xl">🔍</p>
          <h2 className="text-xl font-bold text-gray-800">
            No neighborhoods added yet
          </h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Search for a neighborhood and click &ldquo;Add to Compare&rdquo; to
            see a side-by-side comparison here.
          </p>
          <Link
            to="/"
            className="inline-block mt-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Search neighborhoods
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Neighborhood Comparison
          </h1>
          <button
            onClick={clearComparison}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Clear all
          </button>
        </div>
        <ComparisonPanel neighborhoods={pinned} />
      </div>
    </main>
  );
}

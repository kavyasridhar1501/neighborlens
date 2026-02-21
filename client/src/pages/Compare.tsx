import { Link } from 'react-router-dom';
import { ComparisonPanel } from '../components/ComparisonPanel';
import { useComparison } from '../hooks/useComparison';

export function Compare() {
  const { pinned, clearComparison } = useComparison();

  if (pinned.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">Nothing to compare yet</h2>
          <p className="text-zinc-500 text-sm">
            Search for a neighborhood and click &ldquo;Add to Compare&rdquo; to build a side-by-side comparison.
          </p>
          <Link
            to="/"
            className="inline-block mt-2 px-5 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Search neighborhoods
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Comparison</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {pinned.length} neighborhood{pinned.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={clearComparison}
            className="text-sm text-zinc-400 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        </div>
        <ComparisonPanel neighborhoods={pinned} />
      </div>
    </main>
  );
}

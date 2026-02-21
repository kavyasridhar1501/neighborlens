import type { Neighborhood } from '../types/neighborhood';
import { SentimentBadge } from './SentimentBadge';
import { VibeTag } from './VibeTag';
import { useComparison } from '../hooks/useComparison';

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
}

/**
 * Displays a comprehensive neighborhood intelligence card with scores,
 * sentiment, vibe summary, lifestyle tags, and census demographics.
 */
export function NeighborhoodCard({ neighborhood: n }: NeighborhoodCardProps) {
  const { pinned, addToComparison } = useComparison();
  const isPinned = pinned.some((p) => p._id === n._id);
  const atCapacity = pinned.length >= 2 && !isPinned;

  const census = n.rawData.census;

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{n.name}</h2>
          <p className="text-sm text-gray-500">ZIP: {n.zip}</p>
        </div>
        <SentimentBadge score={n.sentimentScore} />
      </div>

      {/* Vibe summary */}
      <p className="text-gray-700 leading-relaxed text-sm">{n.vibeSummary}</p>

      {/* Lifestyle tags */}
      {n.lifestyleTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {n.lifestyleTags.map((tag) => (
            <VibeTag key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Census row */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Population</p>
          <p className="text-sm font-semibold text-gray-900">
            {census.population > 0 ? census.population.toLocaleString() : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Median Income</p>
          <p className="text-sm font-semibold text-gray-900">
            {census.medianIncome > 0 ? `$${census.medianIncome.toLocaleString()}` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Median Age</p>
          <p className="text-sm font-semibold text-gray-900">
            {census.medianAge > 0 ? census.medianAge : 'N/A'}
          </p>
        </div>
      </div>

      {/* Compare button */}
      <button
        onClick={() => addToComparison(n)}
        disabled={atCapacity}
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isPinned
            ? 'bg-green-100 text-green-800 cursor-default'
            : atCapacity
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
        }`}
      >
        {isPinned ? 'Added ✓' : 'Add to Compare'}
      </button>
    </div>
  );
}

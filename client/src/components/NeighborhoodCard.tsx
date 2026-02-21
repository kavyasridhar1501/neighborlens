import type { Neighborhood } from '../types/neighborhood';
import { SentimentBadge } from './SentimentBadge';
import { VibeTag } from './VibeTag';
import { useComparison } from '../hooks/useComparison';

interface NeighborhoodCardProps {
  neighborhood: Neighborhood;
}

export function NeighborhoodCard({ neighborhood: n }: NeighborhoodCardProps) {
  const { pinned, addToComparison } = useComparison();
  const isPinned = pinned.some((p) => p._id === n._id);
  const census = n.rawData.census;

  return (
    <div className="w-full bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 leading-snug">{n.name}</h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono">ZIP {n.zip}</p>
        </div>
        <SentimentBadge score={n.sentimentScore} />
      </div>

      {/* Vibe summary */}
      <p className="text-zinc-600 leading-relaxed text-sm">{n.vibeSummary}</p>

      {/* Lifestyle tags */}
      {n.lifestyleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {n.lifestyleTags.map((tag) => (
            <VibeTag key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Census row */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-400 font-medium">Population</p>
          <p className="text-sm font-semibold text-zinc-900 mt-0.5">
            {census.population > 0 ? census.population.toLocaleString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-400 font-medium">Median Income</p>
          <p className="text-sm font-semibold text-zinc-900 mt-0.5">
            {census.medianIncome > 0 ? `$${census.medianIncome.toLocaleString()}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-zinc-400 font-medium">Median Age</p>
          <p className="text-sm font-semibold text-zinc-900 mt-0.5">
            {census.medianAge > 0 ? census.medianAge : '—'}
          </p>
        </div>
      </div>

      {/* Compare button */}
      <button
        onClick={() => addToComparison(n)}
        disabled={isPinned}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isPinned
            ? 'bg-zinc-100 text-zinc-500 cursor-default'
            : 'bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800'
        }`}
      >
        {isPinned ? 'Added to Compare ✓' : 'Add to Compare'}
      </button>
    </div>
  );
}

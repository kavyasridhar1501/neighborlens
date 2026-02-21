import type { Neighborhood } from '../types/neighborhood';
import { SentimentBadge } from './SentimentBadge';
import { VibeTag } from './VibeTag';
import { useComparison } from '../hooks/useComparison';

interface ComparisonPanelProps {
  neighborhoods: Neighborhood[];
}

const COLORS = ['#6366f1', '#0ea5e9'] as const;

/**
 * Side-by-side comparison panel for 1 or 2 pinned neighborhoods.
 * Shows a grouped bar chart comparing mobility scores across both.
 */
export function ComparisonPanel({ neighborhoods }: ComparisonPanelProps) {
  const { removeFromComparison } = useComparison();

  const [a, b] = neighborhoods;

  return (
    <div className="space-y-8">
      {/* Side-by-side mini cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* First neighborhood */}
        <NeighborhoodColumn
          neighborhood={a ?? null}
          color={COLORS[0]}
          onRemove={a ? () => removeFromComparison(a._id) : undefined}
        />

        {/* Second neighborhood or placeholder */}
        {b ? (
          <NeighborhoodColumn
            neighborhood={b}
            color={COLORS[1]}
            onRemove={() => removeFromComparison(b._id)}
          />
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[240px]">
            <p className="text-gray-400 text-sm font-medium">
              Search and add a second neighborhood
            </p>
            <p className="text-gray-300 text-xs">
              Go back to the home page to search
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

interface NeighborhoodColumnProps {
  neighborhood: Neighborhood | null;
  color: string;
  onRemove?: () => void;
}

/** Mini summary column used inside the comparison panel */
function NeighborhoodColumn({
  neighborhood: n,
  color,
  onRemove,
}: NeighborhoodColumnProps) {
  if (!n) return null;

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-5 space-y-3 border-t-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{n.name}</h3>
          <p className="text-xs text-gray-500">ZIP: {n.zip}</p>
        </div>
        <SentimentBadge score={n.sentimentScore} />
      </div>

      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
        {n.vibeSummary}
      </p>

      {n.lifestyleTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {n.lifestyleTags.map((tag) => (
            <VibeTag key={tag} tag={tag} />
          ))}
        </div>
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          className="w-full text-xs text-red-500 hover:text-red-700 py-1 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
}

import type { Neighborhood } from '../types/neighborhood';
import { SentimentBadge } from './SentimentBadge';
import { VibeTag } from './VibeTag';
import { useComparison } from '../hooks/useComparison';

interface ComparisonPanelProps {
  neighborhoods: Neighborhood[];
}

const BORDER_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6',
];

/**
 * N-way comparison panel for any number of pinned neighborhoods.
 * Scrollable cards at the top + a full comparison table below.
 */
export function ComparisonPanel({ neighborhoods }: ComparisonPanelProps) {
  const { removeFromComparison } = useComparison();

  return (
    <div className="space-y-8">
      {/* Scrollable neighborhood cards */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {neighborhoods.map((n, i) => (
          <NeighborhoodColumn
            key={n._id}
            neighborhood={n}
            color={BORDER_COLORS[i % BORDER_COLORS.length]!}
            onRemove={() => removeFromComparison(n._id)}
          />
        ))}
      </div>

      {/* Comparison table */}
      {neighborhoods.length >= 2 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">
                  Metric
                </th>
                {neighborhoods.map((n, i) => (
                  <th
                    key={n._id}
                    className="px-4 py-3 text-center font-semibold text-gray-800 text-sm"
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: BORDER_COLORS[i % BORDER_COLORS.length] }}
                    />
                    {n.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Population */}
              <MetricRow
                label="Population"
                neighborhoods={neighborhoods}
                getValue={(n) =>
                  n.rawData.census.population > 0
                    ? n.rawData.census.population.toLocaleString()
                    : 'N/A'
                }
                getNum={(n) => n.rawData.census.population}
              />

              {/* Median Income */}
              <MetricRow
                label="Median Income"
                neighborhoods={neighborhoods}
                getValue={(n) =>
                  n.rawData.census.medianIncome > 0
                    ? `$${n.rawData.census.medianIncome.toLocaleString()}`
                    : 'N/A'
                }
                getNum={(n) => n.rawData.census.medianIncome}
                highlight="high"
              />

              {/* Median Age */}
              <MetricRow
                label="Median Age"
                neighborhoods={neighborhoods}
                getValue={(n) =>
                  n.rawData.census.medianAge > 0
                    ? String(n.rawData.census.medianAge)
                    : 'N/A'
                }
                getNum={(n) => n.rawData.census.medianAge}
              />

              {/* Sentiment */}
              <tr className="bg-white">
                <td className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Sentiment
                </td>
                {neighborhoods.map((n) => (
                  <td key={n._id} className="px-4 py-3 text-center">
                    <SentimentBadge score={n.sentimentScore} />
                  </td>
                ))}
              </tr>

              {/* Walkability (amenity count) */}
              <MetricRow
                label="Nearby Places"
                neighborhoods={neighborhoods}
                getValue={(n) => String(n.rawData.amenities.length)}
                getNum={(n) => n.rawData.amenities.length}
                highlight="high"
              />

              {/* Lifestyle Tags */}
              <tr className="bg-white">
                <td className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Lifestyle
                </td>
                {neighborhoods.map((n) => (
                  <td key={n._id} className="px-4 py-3">
                    {n.lifestyleTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {n.lifestyleTags.map((tag) => (
                          <VibeTag key={tag} tag={tag} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs block text-center">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Community posts */}
              <MetricRow
                label="Community Posts"
                neighborhoods={neighborhoods}
                getValue={(n) =>
                  String(n.rawData.redditPosts.length + n.rawData.reviews.length)
                }
                getNum={(n) => n.rawData.redditPosts.length + n.rawData.reviews.length}
                highlight="high"
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface MetricRowProps {
  label: string;
  neighborhoods: Neighborhood[];
  getValue: (n: Neighborhood) => string;
  getNum: (n: Neighborhood) => number;
  highlight?: 'high' | 'low';
}

/**
 * Renders one row in the comparison table.
 * Highlights the best value in green (highest if highlight="high", lowest if "low").
 */
function MetricRow({ label, neighborhoods, getValue, getNum, highlight }: MetricRowProps) {
  const nums = neighborhoods.map(getNum).filter((v) => v > 0);
  const best = nums.length > 0
    ? highlight === 'low'
      ? Math.min(...nums)
      : Math.max(...nums)
    : null;

  return (
    <tr className="bg-white">
      <td className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </td>
      {neighborhoods.map((n) => {
        const num = getNum(n);
        const isBest = best !== null && num === best && num > 0 && neighborhoods.length >= 2;
        return (
          <td
            key={n._id}
            className={`px-4 py-3 text-center font-semibold ${
              isBest ? 'text-emerald-600' : 'text-gray-800'
            }`}
          >
            {isBest ? (
              <span className="inline-flex items-center gap-1">
                {getValue(n)}
                <span className="text-emerald-500 text-xs">▲</span>
              </span>
            ) : (
              getValue(n)
            )}
          </td>
        );
      })}
    </tr>
  );
}

interface NeighborhoodColumnProps {
  neighborhood: Neighborhood;
  color: string;
  onRemove: () => void;
}

function NeighborhoodColumn({ neighborhood: n, color, onRemove }: NeighborhoodColumnProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-md p-5 space-y-3 border-t-4 flex-shrink-0 w-64"
      style={{ borderColor: color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{n.name}</h3>
          <p className="text-xs text-gray-500">ZIP: {n.zip}</p>
        </div>
        <SentimentBadge score={n.sentimentScore} />
      </div>

      <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
        {n.vibeSummary}
      </p>

      {n.lifestyleTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {n.lifestyleTags.map((tag) => (
            <VibeTag key={tag} tag={tag} />
          ))}
        </div>
      )}

      <button
        onClick={onRemove}
        className="w-full text-xs text-red-500 hover:text-red-700 py-1 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}

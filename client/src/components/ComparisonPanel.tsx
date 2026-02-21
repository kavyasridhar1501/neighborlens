import type { Neighborhood } from '../types/neighborhood';
import { SentimentBadge } from './SentimentBadge';
import { VibeTag } from './VibeTag';
import { useComparison } from '../hooks/useComparison';

interface ComparisonPanelProps {
  neighborhoods: Neighborhood[];
}

/** Muted, distinguishable accent colors for card top-borders */
const BORDER_COLORS = [
  '#18181b', // near-black
  '#0f766e', // teal-700
  '#92400e', // amber-900
  '#1e3a5f', // deep navy
  '#374151', // slate-700
  '#166534', // forest green
  '#7f1d1d', // deep rust
  '#2d4a1e', // dark olive
];

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
        <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-36">
                  Metric
                </th>
                {neighborhoods.map((n, i) => (
                  <th key={n._id} className="px-4 py-3 text-center font-semibold text-zinc-800 text-sm">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                      style={{ backgroundColor: BORDER_COLORS[i % BORDER_COLORS.length] }}
                    />
                    {n.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <MetricRow
                label="Population"
                neighborhoods={neighborhoods}
                getValue={(n) =>
                  n.rawData.census.population > 0
                    ? n.rawData.census.population.toLocaleString()
                    : '—'
                }
                getNum={(n) => n.rawData.census.population}
              />
              <MetricRow
                label="Median Income"
                neighborhoods={neighborhoods}
                getValue={(n) =>
                  n.rawData.census.medianIncome > 0
                    ? `$${n.rawData.census.medianIncome.toLocaleString()}`
                    : '—'
                }
                getNum={(n) => n.rawData.census.medianIncome}
                highlight="high"
              />
              <MetricRow
                label="Median Age"
                neighborhoods={neighborhoods}
                getValue={(n) =>
                  n.rawData.census.medianAge > 0 ? String(n.rawData.census.medianAge) : '—'
                }
                getNum={(n) => n.rawData.census.medianAge}
              />
              <tr className="bg-white">
                <td className="px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Sentiment
                </td>
                {neighborhoods.map((n) => (
                  <td key={n._id} className="px-4 py-3 text-center">
                    <SentimentBadge score={n.sentimentScore} />
                  </td>
                ))}
              </tr>
              <MetricRow
                label="Nearby Places"
                neighborhoods={neighborhoods}
                getValue={(n) => String(n.rawData.amenities.length)}
                getNum={(n) => n.rawData.amenities.length}
                highlight="high"
              />
              <tr className="bg-white">
                <td className="px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
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
                      <span className="text-zinc-400 text-xs block text-center">—</span>
                    )}
                  </td>
                ))}
              </tr>
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

function MetricRow({ label, neighborhoods, getValue, getNum, highlight }: MetricRowProps) {
  const nums = neighborhoods.map(getNum).filter((v) => v > 0);
  const best =
    nums.length > 0
      ? highlight === 'low'
        ? Math.min(...nums)
        : Math.max(...nums)
      : null;

  return (
    <tr className="bg-white">
      <td className="px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
        {label}
      </td>
      {neighborhoods.map((n) => {
        const num = getNum(n);
        const isBest = best !== null && num === best && num > 0 && neighborhoods.length >= 2;
        return (
          <td
            key={n._id}
            className={`px-4 py-3 text-center font-semibold ${
              isBest ? 'text-emerald-700' : 'text-zinc-800'
            }`}
          >
            {isBest ? (
              <span className="inline-flex items-center gap-1">
                {getValue(n)}
                <span className="text-emerald-600 text-xs">▲</span>
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
      className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 space-y-3 border-t-4 flex-shrink-0 w-60"
      style={{ borderTopColor: color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-zinc-900 text-sm leading-tight">{n.name}</h3>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">ZIP {n.zip}</p>
        </div>
        <SentimentBadge score={n.sentimentScore} />
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-4">{n.vibeSummary}</p>

      {n.lifestyleTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {n.lifestyleTags.map((tag) => (
            <VibeTag key={tag} tag={tag} />
          ))}
        </div>
      )}

      <button
        onClick={onRemove}
        className="w-full text-xs text-zinc-400 hover:text-red-600 py-1 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}

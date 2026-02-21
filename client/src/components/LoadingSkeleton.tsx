/**
 * Animated pulse skeleton that mimics the shape of NeighborhoodCard
 * while neighborhood data is loading.
 */
export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6 animate-pulse">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>

      {/* Vibe summary */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        {[80, 96, 72, 88].map((w) => (
          <div
            key={w}
            className="h-6 bg-gray-200 rounded-full"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* Bar chart placeholder */}
      <div className="h-36 bg-gray-200 rounded-xl mb-4" />

      {/* Census row */}
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-full mb-1" />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="w-full bg-white rounded-xl border border-zinc-200 shadow-sm p-6 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-5 bg-zinc-200 rounded w-44 mb-2" />
          <div className="h-3 bg-zinc-100 rounded w-20" />
        </div>
        <div className="h-5 bg-zinc-100 rounded-full w-16" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-zinc-100 rounded w-full" />
        <div className="h-3.5 bg-zinc-100 rounded w-5/6" />
        <div className="h-3.5 bg-zinc-100 rounded w-4/6" />
      </div>
      <div className="flex gap-2">
        {[72, 88, 64, 80].map((w) => (
          <div key={w} className="h-5 bg-zinc-100 rounded-full" style={{ width: `${w}px` }} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-2.5 bg-zinc-100 rounded w-full mb-1.5" />
            <div className="h-4 bg-zinc-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

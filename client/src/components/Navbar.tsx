import { Link } from 'react-router-dom';
import { useComparison } from '../hooks/useComparison';

export function Navbar() {
  const { pinned } = useComparison();

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-semibold text-lg text-zinc-900 tracking-tight hover:text-zinc-600 transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          NeighborLens
        </Link>

        <Link
          to="/compare"
          className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          Compare
          {pinned.length > 0 && (
            <span className="bg-zinc-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pinned.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

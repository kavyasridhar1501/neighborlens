import { Link } from 'react-router-dom';
import { useComparison } from '../hooks/useComparison';

interface NavbarProps {}

/**
 * Top navigation bar with logo and comparison badge.
 */
export function Navbar(_props: NavbarProps) {
  const { pinned } = useComparison();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span className="text-2xl">🏘️</span>
          <span>NeighborLens</span>
        </Link>

        <Link
          to="/compare"
          className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Compare
          {pinned.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pinned.length}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

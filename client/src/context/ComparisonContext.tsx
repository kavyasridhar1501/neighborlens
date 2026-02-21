import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Neighborhood } from '../types/neighborhood';

interface ComparisonContextValue {
  pinned: Neighborhood[];
  addToComparison: (n: Neighborhood) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

/** Provides comparison state for up to 2 pinned neighborhoods */
export function ComparisonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pinned, setPinned] = useState<Neighborhood[]>([]);

  const addToComparison = useCallback((n: Neighborhood) => {
    setPinned((prev) => {
      // Already pinned — no-op
      if (prev.some((p) => p._id === n._id)) return prev;
      // Room available
      if (prev.length < 2) return [...prev, n];
      // Replace the oldest (index 0) when at capacity
      return [prev[1]!, n];
    });
  }, []);

  const removeFromComparison = useCallback((id: string) => {
    setPinned((prev) => prev.filter((p) => p._id !== id));
  }, []);

  const clearComparison = useCallback(() => setPinned([]), []);

  const value = useMemo(
    () => ({ pinned, addToComparison, removeFromComparison, clearComparison }),
    [pinned, addToComparison, removeFromComparison, clearComparison]
  );

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

/**
 * Returns the comparison context. Must be used inside ComparisonProvider.
 */
export function useComparison(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext);
  if (!ctx) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return ctx;
}

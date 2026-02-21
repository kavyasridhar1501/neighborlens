import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { NeighborhoodCard } from '../components/NeighborhoodCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useNeighborhood } from '../hooks/useNeighborhood';

/**
 * Home page with hero section, search bar, and neighborhood results.
 */
export function Home() {
  const [query, setQuery] = useState('');

  const { data, isLoading, isError, error } = useNeighborhood(query);

  function handleSearch(q: string) {
    setQuery(q);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Know Your Neighborhood
            <br />
            Before You Move
          </h1>
          <p className="text-indigo-200 text-lg max-w-xl mx-auto">
            AI-powered insights on walkability, sentiment, lifestyle, and
            demographics for any US neighborhood.
          </p>
          <div className="flex justify-center pt-2">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-5xl mx-auto px-4 py-12 flex flex-col items-center gap-6">
        {isLoading && <LoadingSkeleton />}

        {isError && (
          <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error?.message ?? 'Something went wrong. Please try again.'}
          </div>
        )}

        {data && !isLoading && <NeighborhoodCard neighborhood={data} />}

        {!query && !isLoading && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-5xl mb-4">🗺️</p>
            <p className="text-lg font-medium text-gray-500">
              Search any US city or ZIP code to get started
            </p>
            <p className="text-sm mt-1">
              e.g., &ldquo;Brooklyn NY&rdquo;, &ldquo;Austin TX&rdquo;, or
              &ldquo;94102&rdquo;
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

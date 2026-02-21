import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { NeighborhoodCard } from '../components/NeighborhoodCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MapView } from '../components/MapView';
import { useNeighborhood } from '../hooks/useNeighborhood';

export function Home() {
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, error } = useNeighborhood(query);

  const hasResult = !!data && !isLoading;

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-zinc-950 text-white px-6 py-14">
        <div className="max-w-6xl mx-auto space-y-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
              Know your neighborhood
              <br />
              <span className="text-zinc-400 font-light">before you move.</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-3 max-w-md">
              Demographics, sentiment, walkability, and lifestyle insights for any US city or ZIP.
            </p>
          </div>
          <SearchBar onSearch={setQuery} isLoading={isLoading} />
        </div>
      </section>

      {/* Map + Results layout */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {isError && (
          <div className="mb-6 bg-white border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            {error?.message ?? 'Something went wrong. Please try again.'}
          </div>
        )}

        <div className={`flex gap-6 ${hasResult || isLoading ? 'flex-col lg:flex-row items-start' : 'flex-col'}`}>
          {/* Map — always visible */}
          <div
            className={`w-full ${
              hasResult || isLoading
                ? 'lg:flex-1 h-[420px]'
                : 'h-[480px]'
            }`}
          >
            <MapView
              lat={data?.lat}
              lng={data?.lng}
              label={data?.name}
              className="h-full"
            />
          </div>

          {/* Card / skeleton — only when there's a query */}
          {(isLoading || hasResult) && (
            <div className="w-full lg:w-96 flex-shrink-0">
              {isLoading ? <LoadingSkeleton /> : data && <NeighborhoodCard neighborhood={data} />}
            </div>
          )}
        </div>

        {/* Empty state hint */}
        {!query && !isLoading && (
          <p className="text-center text-zinc-400 text-sm mt-6">
            Search a city or ZIP above — e.g. &ldquo;Brooklyn NY&rdquo;, &ldquo;Austin TX&rdquo;, &ldquo;94102&rdquo;
          </p>
        )}
      </section>
    </main>
  );
}

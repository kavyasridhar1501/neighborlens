import { useQuery } from '@tanstack/react-query';
import { fetchNeighborhood } from '../lib/api';
import type { Neighborhood } from '../types/neighborhood';

const ONE_HOUR_MS = 1000 * 60 * 60;

/**
 * React Query hook for fetching neighborhood intelligence data.
 * Results are cached for 1 hour to match the backend TTL.
 */
export function useNeighborhood(query: string) {
  return useQuery<Neighborhood, Error>({
    queryKey: ['neighborhood', query],
    queryFn: () => fetchNeighborhood(query),
    enabled: query.length >= 2,
    staleTime: ONE_HOUR_MS,
  });
}

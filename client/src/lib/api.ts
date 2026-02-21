import axios from 'axios';
import type { Neighborhood, SavedComparison } from '../types/neighborhood';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
});

/**
 * Fetches neighborhood intelligence data for a city name or ZIP code.
 */
export async function fetchNeighborhood(query: string): Promise<Neighborhood> {
  const { data } = await client.get<Neighborhood>(
    `/neighborhood/${encodeURIComponent(query)}`
  );
  return data;
}

/**
 * Returns all saved neighborhood comparisons, newest first.
 */
export async function fetchSaved(): Promise<SavedComparison[]> {
  const { data } = await client.get<SavedComparison[]>('/saved');
  return data;
}

/**
 * Creates a new saved comparison from an array of 1-2 neighborhood IDs.
 */
export async function saveComparison(
  neighborhoodIds: string[]
): Promise<SavedComparison> {
  const { data } = await client.post<SavedComparison>('/saved', {
    neighborhoodIds,
  });
  return data;
}

/**
 * Deletes a saved comparison by its database ID.
 */
export async function deleteComparison(id: string): Promise<void> {
  await client.delete(`/saved/${id}`);
}

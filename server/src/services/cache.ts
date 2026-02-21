import { Neighborhood, INeighborhood } from '../models/Neighborhood';

const CACHE_TTL_HOURS = 24;

/**
 * Returns true if the cached document was stored within the TTL window.
 */
export function isFresh(cachedAt: Date): boolean {
  const ageMs = Date.now() - cachedAt.getTime();
  return ageMs < CACHE_TTL_HOURS * 60 * 60 * 1000;
}

/**
 * Looks up a neighborhood by ZIP code.
 * Returns null if not found or if the cached entry is stale.
 */
export async function checkCache(zip: string): Promise<INeighborhood | null> {
  const doc = await Neighborhood.findOne({ zip });
  if (!doc) return null;
  if (!isFresh(doc.cachedAt)) return null;
  return doc;
}

/**
 * Persists (or updates) a neighborhood document in MongoDB.
 * Always refreshes cachedAt to the current time.
 */
export async function saveToCache(
  data: Omit<INeighborhood, keyof import('mongoose').Document | 'createdAt' | 'updatedAt'>
): Promise<INeighborhood> {
  const doc = await Neighborhood.findOneAndUpdate(
    { zip: (data as { zip: string }).zip },
    { ...data, cachedAt: new Date() },
    { upsert: true, new: true }
  );
  return doc as INeighborhood;
}

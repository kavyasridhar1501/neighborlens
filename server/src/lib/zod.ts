import { z } from 'zod';

/** Schema for validating neighborhood query strings */
export const NeighborhoodQuerySchema = z.string().min(2).max(100).trim();

/** Schema for validating saved comparison creation payloads */
export const SaveComparisonSchema = z.object({
  neighborhoodIds: z.array(z.string()).min(1).max(2),
});

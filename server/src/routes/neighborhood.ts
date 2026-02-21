import { Router, Request, Response, NextFunction } from 'express';
import { NeighborhoodQuerySchema } from '../lib/zod';
import { getNeighborhoodData } from '../services/neighborhood';

const router = Router();

/**
 * GET /api/neighborhood/:query
 * Fetches neighborhood intelligence data for a city name or ZIP code.
 */
router.get(
  '/:query',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = NeighborhoodQuerySchema.safeParse(req.params.query);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Invalid query',
          status: 400,
          message: 'Query must be between 2 and 100 characters.',
        });
        return;
      }

      const neighborhood = await getNeighborhoodData(parseResult.data);
      res.json(neighborhood);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

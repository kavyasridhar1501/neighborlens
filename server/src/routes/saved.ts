import { Router, Request, Response, NextFunction } from 'express';
import { SavedComparison } from '../models/SavedComparison';
import { SaveComparisonSchema } from '../lib/zod';

const router = Router();

/**
 * GET /api/saved
 * Returns all saved neighborhood comparisons, newest first.
 */
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const comparisons = await SavedComparison.find().sort({ createdAt: -1 });
      res.json(comparisons);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/saved
 * Creates a new saved comparison from an array of 1-2 neighborhood IDs.
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = SaveComparisonSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          error: 'Invalid payload',
          status: 400,
          message: 'neighborhoodIds must be an array of 1-2 strings.',
        });
        return;
      }

      const comparison = await SavedComparison.create({
        neighborhoodIds: parseResult.data.neighborhoodIds,
      });
      res.status(201).json(comparison);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/saved/:id
 * Deletes a saved comparison by its MongoDB document ID.
 */
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deleted = await SavedComparison.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({
          error: 'Not found',
          status: 404,
          message: 'Saved comparison not found.',
        });
        return;
      }
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

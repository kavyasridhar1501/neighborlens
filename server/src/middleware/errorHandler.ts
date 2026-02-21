import { Request, Response, NextFunction } from 'express';

/** Shape of error objects passed to this middleware */
interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Express error handler middleware.
 * Returns a consistent JSON error response and never leaks stack traces.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err);
  }

  res.status(status).json({
    error: 'Request failed',
    status,
    message,
  });
}

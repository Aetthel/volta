import type { Request, Response, NextFunction, RequestHandler } from "express";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown> | unknown;

/**
 * A wrapper function that catches any rejected promises from asynchronous Express route handlers
 * and forwards them to the next middleware (the global error handler) automatically.
 */
export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      next(err);
    }
  };

export default asyncHandler;

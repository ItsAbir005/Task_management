import { Request, Response, NextFunction } from 'express';

type AsyncFn = (req: Request & Record<string, any>, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFn) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req as any, res, next);
    } catch (err) {
      next(err);
    }
  };
};

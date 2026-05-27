import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';

/**
 * Validates that named route params are valid MongoDB ObjectIds.
 * Prevents CastErrors from reaching the DB layer and leaking 500s.
 * Usage: router.get('/:id', validateMongoId(), handler)
 *        router.get('/:orderId/items/:itemId', validateMongoId('orderId', 'itemId'), handler)
 */
export const validateMongoId = (...paramNames: string[]) => {
  const names = paramNames.length ? paramNames : ['id'];
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const name of names) {
      const val = req.params[name];
      if (val !== undefined && !mongoose.isValidObjectId(val)) {
        throw AppError.badRequest(`Invalid ${name}: must be a valid identifier`);
      }
    }
    next();
  };
};

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: Array<{ field: string; message: string }> | undefined;
  let code = 'INTERNAL_ERROR';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    code = err.code ?? code;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 422;
    message = 'Mongoose validation failed';
    code = 'VALIDATION_ERROR';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    code = 'CONFLICT';
    const field = Object.keys((err as any).keyPattern || {})[0] || 'field';
    errors = [{ field, message: `${field} already exists` }];
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }

  if (statusCode >= 500) {
    logger.error('Unhandled error', {
      err: { message: err.message, stack: err.stack, name: err.name },
      req: { method: req.method, url: req.url, requestId: req.headers['x-request-id'] },
    });
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    errors,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

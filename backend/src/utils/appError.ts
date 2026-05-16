export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode = 500,
    options?: {
      code?: string;
      isOperational?: boolean;
      errors?: Array<{ field: string; message: string }>;
    },
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? true;
    this.code = options?.code;
    this.errors = options?.errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Array<{ field: string; message: string }>): AppError {
    return new AppError(message, 400, { code: 'BAD_REQUEST', errors });
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 401, { code: 'UNAUTHORIZED' });
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403, { code: 'FORBIDDEN' });
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404, { code: 'NOT_FOUND' });
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, { code: 'CONFLICT' });
  }

  static tooManyRequests(message = 'Too many requests'): AppError {
    return new AppError(message, 429, { code: 'RATE_LIMITED' });
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500, { code: 'INTERNAL_ERROR', isOperational: false });
  }

  static serviceUnavailable(message = 'Service unavailable'): AppError {
    return new AppError(message, 503, { code: 'SERVICE_UNAVAILABLE' });
  }
}

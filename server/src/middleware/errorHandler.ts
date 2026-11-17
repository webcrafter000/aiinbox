import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  const responseBody = {
    error: {
      message: err.message || 'Internal Server Error',
      ...(isAppError && err.details ? { details: err.details } : {}),
      status: statusCode,
    },
  };

  if (statusCode >= 500) {
    console.error(`[Unhandled Error]`, err);
  }

  res.status(statusCode).json(responseBody);
}

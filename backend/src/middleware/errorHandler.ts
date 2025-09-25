import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Error interno del servidor';
  let code = error.code || 'INTERNAL_ERROR';

  // Log the error
  logger.error('Error Handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || 'anonymous',
  });

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[] | undefined;
        statusCode = 409;
        message = `Ya existe un registro con este ${field?.[0] || 'valor'}`;
        code = 'DUPLICATE_ENTRY';
        break;
      
      case 'P2025':
        // Record not found
        statusCode = 404;
        message = 'Registro no encontrado';
        code = 'NOT_FOUND';
        break;
      
      case 'P2003':
        // Foreign key constraint violation
        statusCode = 400;
        message = 'Referencia inválida a otro registro';
        code = 'INVALID_REFERENCE';
        break;
      
      case 'P2014':
        // Required relation violation
        statusCode = 400;
        message = 'Relación requerida faltante';
        code = 'MISSING_RELATION';
        break;
      
      default:
        statusCode = 500;
        message = 'Error de base de datos';
        code = 'DATABASE_ERROR';
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
    code = 'VALIDATION_ERROR';
  }

  // Handle Prisma connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = 'Error de conexión a la base de datos';
    code = 'DATABASE_CONNECTION_ERROR';
  }

  // Handle JWT errors (if not caught by auth middleware)
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
    code = 'INVALID_TOKEN';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
    code = 'TOKEN_EXPIRED';
  }

  // Handle validation errors from express-validator
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
    code = 'VALIDATION_ERROR';
  }

  // Handle multer errors (file upload)
  if (error.name === 'MulterError') {
    statusCode = 400;
    switch ((error as any).code) {
      case 'LIMIT_FILE_SIZE':
        message = 'El archivo es demasiado grande';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Demasiados archivos';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Campo de archivo inesperado';
        code = 'UNEXPECTED_FILE';
        break;
      default:
        message = 'Error al subir archivo';
        code = 'FILE_UPLOAD_ERROR';
    }
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Error interno del servidor';
    code = 'INTERNAL_ERROR';
  }

  // Send error response
  const errorResponse: any = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      originalMessage: error.message,
      name: error.name,
    };
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create specific error types
export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Acceso prohibido') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Conflicto de datos') {
    super(message, 409, 'CONFLICT');
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string = 'Solicitud inválida') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = 'Error interno del servidor') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}
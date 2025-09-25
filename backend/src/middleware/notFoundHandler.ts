import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `Ruta no encontrada: ${req.method} ${req.originalUrl}`;
  
  // Log the 404 error
  logger.warn('404 - Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || 'anonymous',
  });

  res.status(404).json({
    error: 'Ruta no encontrada',
    code: 'ROUTE_NOT_FOUND',
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  });
};
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { logger, logAuth, logSecurity } from '@/utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logSecurity('Missing authorization header', { ip: req.ip, url: req.url });
      return res.status(401).json({
        error: 'Token de acceso requerido',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      logSecurity('Malformed authorization header', { ip: req.ip, url: req.url });
      return res.status(401).json({
        error: 'Formato de token inválido',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET no está configurado');
      return res.status(500).json({
        error: 'Error de configuración del servidor',
        code: 'SERVER_CONFIG_ERROR'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      }
    });

    if (!user) {
      logSecurity('Token with non-existent user', { 
        userId: decoded.userId, 
        ip: req.ip 
      });
      return res.status(401).json({
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      logSecurity('Token for inactive user', { 
        userId: user.id, 
        ip: req.ip 
      });
      return res.status(401).json({
        error: 'Cuenta desactivada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    logAuth('Token validated', user.id, req.ip, true);
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logSecurity('Invalid JWT token', { 
        error: error.message, 
        ip: req.ip 
      });
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      logSecurity('Expired JWT token', { ip: req.ip });
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    logger.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Middleware to check if user has specific role
export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      logSecurity('Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        ip: req.ip,
        url: req.url
      });
      
      return res.status(403).json({
        error: 'Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Middleware to check if user is coach
export const requireCoach = requireRole(['COACH', 'ADMIN']);

// Middleware to check if user is admin
export const requireAdmin = requireRole('ADMIN');

// Middleware to check if user can access resource (owner or coach)
export const requireOwnershipOrCoach = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { userId } = req.params;
    const currentUser = req.user;

    // Admin can access everything
    if (currentUser.role === 'ADMIN') {
      return next();
    }

    // User can access their own resources
    if (userId === currentUser.id) {
      return next();
    }

    // Coach can access their athletes' resources
    if (currentUser.role === 'COACH') {
      const coachRelation = await prisma.coachAthlete.findFirst({
        where: {
          coachId: currentUser.id,
          athleteId: userId,
          status: 'ACTIVE'
        }
      });

      if (coachRelation) {
        return next();
      }
    }

    logSecurity('Unauthorized resource access attempt', {
      userId: currentUser.id,
      targetUserId: userId,
      ip: req.ip,
      url: req.url
    });

    return res.status(403).json({
      error: 'No tienes permisos para acceder a este recurso',
      code: 'RESOURCE_ACCESS_DENIED'
    });

  } catch (error) {
    logger.error('Error en middleware de ownership:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      }
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    }

    next();

  } catch (error) {
    // Silently continue without user info if token is invalid
    next();
  }
};
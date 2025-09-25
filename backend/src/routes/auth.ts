import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { logger, logAuth } from '@/utils/logger';
import { ValidationError, ConflictError, UnauthorizedError, BadRequestError } from '@/middleware/errorHandler';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('role')
    .optional()
    .isIn(['COACH', 'ATHLETE'])
    .withMessage('El rol debe ser COACH o ATHLETE'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

// Helper function to generate JWT token
const generateToken = (userId: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET no está configurado');
  }

  return jwt.sign(
    { userId, email, role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper function to validate request
const validateRequest = (req: express.Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
};

// POST /api/auth/register
router.post('/register', registerValidation, async (req, res) => {
  try {
    validateRequest(req);

    const { email, password, firstName, lastName, role = 'ATHLETE' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      logAuth('Registration failed - email exists', undefined, req.ip, false);
      throw new ConflictError('Ya existe un usuario con este email');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        profile: {
          create: {
            language: 'es',
            timezone: 'Europe/Madrid',
          }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            language: true,
            timezone: true,
          }
        }
      }
    });

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    logAuth('User registered', user.id, req.ip, true);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token,
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  try {
    validateRequest(req);

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        profile: {
          select: {
            language: true,
            timezone: true,
          }
        }
      }
    });

    if (!user) {
      logAuth('Login failed - user not found', undefined, req.ip, false);
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (!user.isActive) {
      logAuth('Login failed - account disabled', user.id, req.ip, false);
      throw new UnauthorizedError('Cuenta desactivada');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logAuth('Login failed - invalid password', user.id, req.ip, false);
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    logAuth('User logged in', user.id, req.ip, true);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword,
      token,
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/auth/refresh
router.post('/refresh', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    // Generate new token
    const token = generateToken(req.user.id, req.user.email, req.user.role);

    logAuth('Token refreshed', req.user.id, req.ip, true);

    res.json({
      message: 'Token renovado exitosamente',
      token,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            dateOfBirth: true,
            gender: true,
            height: true,
            weight: true,
            timezone: true,
            language: true,
            sportTypes: true,
            fitnessLevel: true,
            goals: true,
            restingHR: true,
            maxHR: true,
            vo2Max: true,
            isPublic: true,
            allowMessages: true,
          }
        },
        _count: {
          select: {
            coachingRelations: {
              where: { status: 'ACTIVE' }
            },
            athleteRelations: {
              where: { status: 'ACTIVE' }
            },
            activities: true,
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    res.json({
      user,
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/auth/change-password
router.post('/change-password', [
  authMiddleware,
  body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true }
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      logAuth('Password change failed - invalid current password', user.id, req.ip, false);
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    logAuth('Password changed', user.id, req.ip, true);

    res.json({
      message: 'Contraseña cambiada exitosamente',
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario no autenticado');
    }

    logAuth('User logged out', req.user.id, req.ip, true);

    res.json({
      message: 'Sesión cerrada exitosamente',
    });

  } catch (error) {
    throw error;
  }
});

export default router;
import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError } from '@/middleware/errorHandler';
import { authMiddleware, requireCoach, requireOwnershipOrCoach, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// Helper function to validate request
const validateRequest = (req: express.Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
};

// GET /api/users/profile/:userId?
router.get('/profile/:userId?', authMiddleware, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const targetUserId = req.params['userId'] || req.user.id;
    const isOwnProfile = targetUserId === req.user.id;

    // Check if user can view this profile
    if (!isOwnProfile) {
      const relationship = await prisma.coachAthlete.findFirst({
        where: {
          OR: [
            { coachId: req.user.id, athleteId: targetUserId, status: 'ACTIVE' },
            { coachId: targetUserId, athleteId: req.user.id, status: 'ACTIVE' }
          ]
        }
      });

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { profile: { select: { isPublic: true } } }
      });

      if (!relationship && !targetUser?.profile?.isPublic) {
        throw new ForbiddenError('No tienes permisos para ver este perfil');
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: isOwnProfile,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        profile: {
          select: {
            dateOfBirth: isOwnProfile,
            gender: true,
            height: true,
            weight: true,
            timezone: isOwnProfile,
            language: isOwnProfile,
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
            activities: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
              }
            },
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    res.json({ user });

  } catch (error) {
    throw error;
  }
});

// PUT /api/users/profile
router.put('/profile', [
  authMiddleware,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']),
  body('height').optional().isFloat({ min: 50, max: 300 }),
  body('weight').optional().isFloat({ min: 20, max: 500 }),
  body('timezone').optional().isString(),
  body('language').optional().isIn(['es', 'en', 'fr', 'de']),
  body('sportTypes').optional().isArray(),
  body('fitnessLevel').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']),
  body('goals').optional().isArray(),
  body('restingHR').optional().isInt({ min: 30, max: 120 }),
  body('maxHR').optional().isInt({ min: 120, max: 250 }),
  body('vo2Max').optional().isFloat({ min: 10, max: 100 }),
  body('isPublic').optional().isBoolean(),
  body('allowMessages').optional().isBoolean(),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      height,
      weight,
      timezone,
      language,
      sportTypes,
      fitnessLevel,
      goals,
      restingHR,
      maxHR,
      vo2Max,
      isPublic,
      allowMessages,
    } = req.body;

    // Update user basic info
    const userUpdateData: any = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;

    // Update profile
    const profileUpdateData: any = {};
    if (dateOfBirth !== undefined) profileUpdateData.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) profileUpdateData.gender = gender;
    if (height !== undefined) profileUpdateData.height = height;
    if (weight !== undefined) profileUpdateData.weight = weight;
    if (timezone !== undefined) profileUpdateData.timezone = timezone;
    if (language !== undefined) profileUpdateData.language = language;
    if (sportTypes !== undefined) profileUpdateData.sportTypes = sportTypes;
    if (fitnessLevel !== undefined) profileUpdateData.fitnessLevel = fitnessLevel;
    if (goals !== undefined) profileUpdateData.goals = goals;
    if (restingHR !== undefined) profileUpdateData.restingHR = restingHR;
    if (maxHR !== undefined) profileUpdateData.maxHR = maxHR;
    if (vo2Max !== undefined) profileUpdateData.vo2Max = vo2Max;
    if (isPublic !== undefined) profileUpdateData.isPublic = isPublic;
    if (allowMessages !== undefined) profileUpdateData.allowMessages = allowMessages;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...userUpdateData,
        profile: {
          update: profileUpdateData
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
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
        }
      }
    });

    logger.info('User profile updated', { userId: req.user.id });

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/users/athletes (for coaches)
router.get('/athletes', [
  authMiddleware,
  requireCoach,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['PENDING', 'ACTIVE', 'INACTIVE']),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const search = req.query['search'] as string;
    const status = req.query['status'] as string || 'ACTIVE';
    const skip = (page - 1) * limit;

    const where: any = {
      coachId: req.user.id,
      status,
    };

    if (search) {
      where.athlete = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      };
    }

    const [athletes, total] = await Promise.all([
      prisma.coachAthlete.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              profile: {
                select: {
                  gender: true,
                  dateOfBirth: true,
                  fitnessLevel: true,
                  sportTypes: true,
                }
              },
              _count: {
                select: {
                  activities: {
                    where: {
                      createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.coachAthlete.count({ where })
    ]);

    res.json({
      athletes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/users/invite-athlete
router.post('/invite-athlete', [
  authMiddleware,
  requireCoach,
  body('email').isEmail().normalizeEmail(),
  body('message').optional().isString().isLength({ max: 500 }),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { email, message } = req.body;

    // Check if athlete exists
    const athlete = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, firstName: true, lastName: true }
    });

    if (!athlete) {
      throw new NotFoundError('No se encontró un usuario con ese email');
    }

    if (athlete.role !== 'ATHLETE') {
      throw new ValidationError('El usuario debe tener rol de atleta');
    }

    // Check if relationship already exists
    const existingRelation = await prisma.coachAthlete.findFirst({
      where: {
        coachId: req.user.id,
        athleteId: athlete.id,
      }
    });

    if (existingRelation) {
      throw new ConflictError('Ya existe una relación con este atleta');
    }

    // Create relationship
    const relation = await prisma.coachAthlete.create({
      data: {
        coachId: req.user.id,
        athleteId: athlete.id,
        status: 'PENDING',
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Create notification for athlete
    await prisma.notification.create({
      data: {
        userId: athlete.id,
        type: 'COACH_INVITATION',
        title: 'Nueva invitación de entrenador',
        message: `${req.user.firstName} ${req.user.lastName} te ha invitado a ser su atleta${message ? `: ${message}` : ''}`,
        data: {
          coachId: req.user.id,
          relationId: relation.id,
        }
      }
    });

    logger.info('Coach invited athlete', {
      coachId: req.user.id,
      athleteId: athlete.id,
      relationId: relation.id,
    });

    res.status(201).json({
      message: 'Invitación enviada exitosamente',
      relation,
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/users/respond-invitation/:relationId
router.post('/respond-invitation/:relationId', [
  authMiddleware,
  param('relationId').isUUID(),
  body('accept').isBoolean(),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { relationId } = req.params;
    const { accept } = req.body;

    const relation = await prisma.coachAthlete.findUnique({
      where: { id: relationId },
      select: {
        id: true,
        athleteId: true,
        status: true,
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!relation) {
      throw new NotFoundError('Invitación no encontrada');
    }

    if (relation.athleteId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para responder esta invitación');
    }

    if (relation.status !== 'PENDING') {
      throw new ValidationError('Esta invitación ya ha sido respondida');
    }

    const newStatus = accept ? 'ACTIVE' : 'REJECTED';

    const updatedRelation = await prisma.coachAthlete.update({
      where: { id: relationId },
      data: { status: newStatus },
      select: {
        id: true,
        status: true,
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    // Create notification for coach
    await prisma.notification.create({
      data: {
        userId: relation.coach.id,
        type: accept ? 'INVITATION_ACCEPTED' : 'INVITATION_REJECTED',
        title: accept ? 'Invitación aceptada' : 'Invitación rechazada',
        message: `${req.user.firstName} ${req.user.lastName} ha ${accept ? 'aceptado' : 'rechazado'} tu invitación`,
        data: {
          athleteId: req.user.id,
          relationId: relation.id,
        }
      }
    });

    logger.info('Invitation responded', {
      relationId,
      athleteId: req.user.id,
      coachId: relation.coach.id,
      accepted: accept,
    });

    res.json({
      message: accept ? 'Invitación aceptada exitosamente' : 'Invitación rechazada',
      relation: updatedRelation,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/users/search
router.get('/search', [
  authMiddleware,
  query('q').isString().isLength({ min: 2 }),
  query('type').optional().isIn(['COACH', 'ATHLETE']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const query = req.query['q'] as string;
    const type = req.query['type'] as string;
    const limit = parseInt(req.query['limit'] as string) || 20;

    const where: any = {
      AND: [
        { id: { not: req.user.id } }, // Exclude current user
        { isActive: true },
        {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ]
        },
        {
          profile: {
            isPublic: true,
          }
        }
      ]
    };

    if (type) {
      where.AND.push({ role: type });
    }

    const users = await prisma.user.findMany({
      where,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        profile: {
          select: {
            sportTypes: true,
            fitnessLevel: true,
          }
        }
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });

    res.json({ users });

  } catch (error) {
    throw error;
  }
});

export default router;
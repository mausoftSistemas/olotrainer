import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ValidationError, NotFoundError, ForbiddenError } from '@/middleware/errorHandler';
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

// GET /api/workouts/templates
router.get('/templates', [
  authMiddleware,
  requireCoach,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('category').optional().isString(),
  query('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const search = req.query['search'] as string;
    const category = req.query['category'] as string;
    const difficulty = req.query['difficulty'] as string;
    const skip = (page - 1) * limit;

    const where: any = {
      creatorId: req.user.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const [templates, total] = await Promise.all([
      prisma.workoutTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          difficulty: true,
          estimatedDuration: true,
          equipment: true,
          createdAt: true,
          updatedAt: true,
          exercises: {
            select: {
              id: true,
              order: true,
              exercise: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  muscleGroups: true,
                }
              },
              sets: true,
              reps: true,
              weight: true,
              duration: true,
              distance: true,
              restTime: true,
              notes: true,
            },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              workouts: true,
            }
          }
        }
      }),
      prisma.workoutTemplate.count({ where })
    ]);

    res.json({
      templates,
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

// POST /api/workouts/templates
router.post('/templates', [
  authMiddleware,
  requireCoach,
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('category').isString(),
  body('difficulty').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  body('estimatedDuration').optional().isInt({ min: 1 }),
  body('targetMuscleGroups').optional().isArray(),
  body('equipment').optional().isArray(),
  body('exercises').isArray().custom((exercises) => {
    if (!Array.isArray(exercises) || exercises.length === 0) {
      throw new Error('Debe incluir al menos un ejercicio');
    }
    return true;
  }),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const {
      name,
      description,
      category,
      difficulty,
      estimatedDuration,
      targetMuscleGroups,
      equipment,
      exercises,
    } = req.body;

    // Validate exercises
    for (const [index, exercise] of exercises.entries()) {
      if (!exercise.exerciseId || !exercise.sets) {
        throw new ValidationError(`Ejercicio ${index + 1}: exerciseId y sets son requeridos`);
      }
    }

    const template = await prisma.workoutTemplate.create({
      data: {
        name,
        description,
        category,
        difficulty,
        estimatedDuration,
        equipment,
        creatorId: req.user.id,
        exercises: {
          create: exercises.map((exercise: any, index: number) => ({
            exerciseId: exercise.exerciseId,
            order: index + 1,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            duration: exercise.duration,
            distance: exercise.distance,
            restTime: exercise.restTime,
            notes: exercise.notes,
          }))
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        estimatedDuration: true,
        equipment: true,
        createdAt: true,
        exercises: {
          select: {
            id: true,
            order: true,
            exercise: {
              select: {
                id: true,
                name: true,
                category: true,
                muscleGroups: true,
              }
            },
            sets: true,
            reps: true,
            weight: true,
            duration: true,
            distance: true,
            restTime: true,
            notes: true,
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    logger.info('Workout template created', {
      templateId: template.id,
      coachId: req.user.id,
      exerciseCount: exercises.length,
    });

    res.status(201).json({
      message: 'Plantilla de entrenamiento creada exitosamente',
      template,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/workouts/templates/:templateId
router.get('/templates/:templateId', [
  authMiddleware,
  param('templateId').isUUID(),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { templateId } = req.params;

    const template = await prisma.workoutTemplate.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        estimatedDuration: true,
        equipment: true,
        creatorId: true,
        createdAt: true,
        updatedAt: true,
        exercises: {
          select: {
            id: true,
            order: true,
            exercise: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                muscleGroups: true,
                equipment: true,
                instructions: true,
              }
            },
            sets: true,
            reps: true,
            weight: true,
            duration: true,
            distance: true,
            restTime: true,
            notes: true,
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            workouts: true,
          }
        }
      }
    });

    if (!template) {
      throw new NotFoundError('Plantilla de entrenamiento no encontrada');
    }

    // Check if user can access this template
    if (template.creatorId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('No tienes permisos para ver esta plantilla');
    }

    res.json({ template });

  } catch (error) {
    throw error;
  }
});

// PUT /api/workouts/templates/:templateId
router.put('/templates/:templateId', [
  authMiddleware,
  requireCoach,
  param('templateId').isUUID(),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('category').optional().isString(),
  body('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  body('estimatedDuration').optional().isInt({ min: 1 }),
  body('targetMuscleGroups').optional().isArray(),
  body('equipment').optional().isArray(),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { templateId } = req.params;

    // Check if template exists and user owns it
    const existingTemplate = await prisma.workoutTemplate.findUnique({
      where: { id: templateId as string },
      select: { id: true, creatorId: true }
    });

    if (!existingTemplate) {
      throw new NotFoundError('Plantilla de entrenamiento no encontrada');
    }

    if (existingTemplate.creatorId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para editar esta plantilla');
    }

    const updateData: any = {};
    const {
      name,
      description,
      category,
      difficulty,
      estimatedDuration,
      equipment,
    } = req.body;

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;
    if (equipment !== undefined) updateData.equipment = equipment;

    const template = await prisma.workoutTemplate.update({
      where: { id: templateId as string },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        estimatedDuration: true,
        equipment: true,
        updatedAt: true,
      }
    });

    logger.info('Workout template updated', {
      templateId,
      coachId: req.user.id,
    });

    res.json({
      message: 'Plantilla de entrenamiento actualizada exitosamente',
      template,
    });

  } catch (error) {
    throw error;
  }
});

// DELETE /api/workouts/templates/:templateId
router.delete('/templates/:templateId', [
  authMiddleware,
  requireCoach,
  param('templateId').isUUID(),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { templateId } = req.params;

    // Check if template exists and user owns it
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: templateId as string },
      select: {
        id: true,
        creatorId: true,
        workouts: {
          where: {
            assignments: {
              some: {
                status: { in: ['ASSIGNED', 'IN_PROGRESS'] }
              }
            }
          }
        }
      }
    });

    if (!template) {
      throw new NotFoundError('Plantilla de entrenamiento no encontrada');
    }

    if (template.creatorId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para eliminar esta plantilla');
    }

    if (template.workouts.length > 0) {
      throw new ValidationError('No se puede eliminar una plantilla que tiene asignaciones activas');
    }

    await prisma.workoutTemplate.delete({
      where: { id: templateId as string }
    });

    logger.info('Workout template deleted', {
      templateId,
      coachId: req.user.id,
    });

    res.json({
      message: 'Plantilla de entrenamiento eliminada exitosamente',
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/workouts/assign
router.post('/assign', [
  authMiddleware,
  requireCoach,
  body('templateId').isUUID(),
  body('athleteId').isUUID(),
  body('scheduledDate').isISO8601(),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { templateId, athleteId, scheduledDate, notes, priority = 'MEDIUM' } = req.body;

    // Verify coach-athlete relationship
    const relationship = await prisma.coachAthlete.findFirst({
      where: {
        coachId: req.user.id,
        athleteId,
        status: 'ACTIVE',
      }
    });

    if (!relationship) {
      throw new ForbiddenError('No tienes una relación activa con este atleta');
    }

    // Verify template exists and belongs to coach
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: templateId as string },
      select: {
        id: true,
        creatorId: true,
        name: true,
        estimatedDuration: true,
      }
    });

    if (!template) {
      throw new NotFoundError('Plantilla de entrenamiento no encontrada');
    }

    if (template.creatorId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para asignar esta plantilla');
    }

    // Create workout from template first
    const workout = await prisma.workout.create({
      data: {
        name: template.name,
        creatorId: req.user.id,
        workoutTemplateId: templateId,
        estimatedDuration: template.estimatedDuration,
        status: 'PLANNED',
      }
    });

    const assignment = await prisma.workoutAssignment.create({
      data: {
        workoutId: workout.id,
        athleteId,
        scheduledDate: new Date(scheduledDate),
        notes,
        priority,
        status: 'ASSIGNED',
      },
      select: {
        id: true,
        scheduledDate: true,
        notes: true,
        priority: true,
        status: true,
        createdAt: true,
        workout: {
          select: {
            id: true,
            name: true,
            description: true,
            difficulty: true,
            estimatedDuration: true,
          }
        },
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    // Create notification for athlete
    await prisma.notification.create({
      data: {
        userId: athleteId,
        type: 'WORKOUT_ASSIGNED',
        title: 'Nuevo entrenamiento asignado',
        message: `${req.user.firstName} ${req.user.lastName} te ha asignado el entrenamiento "${template.name}"`,
        data: {
          assignmentId: assignment.id,
          templateId,
          coachId: req.user.id,
        }
      }
    });

    logger.info('Workout assigned', {
      assignmentId: assignment.id,
      templateId,
      coachId: req.user.id,
      athleteId,
    });

    res.status(201).json({
      message: 'Entrenamiento asignado exitosamente',
      assignment,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/workouts/assignments
router.get('/assignments', [
  authMiddleware,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
  query('athleteId').optional().isUUID(),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
], async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 20;
    const status = req.query['status'] as string;
    const athleteId = req.query['athleteId'] as string;
    const from = req.query['from'] as string;
    const to = req.query['to'] as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (req.user.role === 'COACH') {
      where.coachId = req.user.id;
      if (athleteId) {
        where.athleteId = athleteId;
      }
    } else {
      where.athleteId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (from || to) {
      where.scheduledDate = {};
      if (from) where.scheduledDate.gte = new Date(from);
      if (to) where.scheduledDate.lte = new Date(to);
    }

    const [assignments, total] = await Promise.all([
      prisma.workoutAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        select: {
          id: true,
          scheduledDate: true,
          completedAt: true,
          notes: true,
          priority: true,
          status: true,
          createdAt: true,
          template: {
            select: {
              id: true,
              name: true,
              description: true,
              difficulty: true,
              estimatedDuration: true,
              category: true,
            }
          },
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          coach: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          workout: {
            select: {
              id: true,
              duration: true,
              notes: true,
              rating: true,
            }
          }
        }
      }),
      prisma.workoutAssignment.count({ where })
    ]);

    res.json({
      assignments,
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

export default router;
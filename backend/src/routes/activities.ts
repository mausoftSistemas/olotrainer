import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ValidationError, NotFoundError, ForbiddenError } from '@/middleware/errorHandler';
import { authMiddleware, requireOwnershipOrCoach, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// Helper function to validate request
const validateRequest = (req: express.Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
};

// GET /api/activities
router.get('/', [
  authMiddleware,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('userId').optional().isUUID(),
  query('type').optional().isIn(['RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'YOGA', 'OTHER']),
  query('source').optional().isIn(['MANUAL', 'STRAVA', 'GARMIN', 'POLAR', 'FITBIT']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.query.userId as string || req.user.id;
    const type = req.query.type as string;
    const source = req.query.source as string;
    const from = req.query.from as string;
    const to = req.query.to as string;
    const skip = (page - 1) * limit;

    // Check if user can view activities for the specified userId
    if (userId !== req.user.id) {
      if (req.user.role === 'COACH') {
        const relationship = await prisma.coachAthlete.findFirst({
          where: {
            coachId: req.user.id,
            athleteId: userId,
            status: 'ACTIVE',
          }
        });
        if (!relationship) {
          throw new ForbiddenError('No tienes permisos para ver las actividades de este usuario');
        }
      } else {
        throw new ForbiddenError('No tienes permisos para ver las actividades de este usuario');
      }
    }

    const where: any = {
      userId,
    };

    if (type) {
      where.type = type;
    }

    if (source) {
      where.source = source;
    }

    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
        select: {
          id: true,
          name: true,
          type: true,
          source: true,
          startTime: true,
          endTime: true,
          duration: true,
          distance: true,
          calories: true,
          notes: true,
          isPublic: true,
          createdAt: true,
          metrics: {
            select: {
              id: true,
              avgHeartRate: true,
              maxHeartRate: true,
              avgPower: true,
              maxPower: true,
              avgSpeed: true,
              maxSpeed: true,
              elevationGain: true,
              trainingLoad: true,
            }
          },
          workoutAssignment: {
            select: {
              id: true,
              template: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        }
      }),
      prisma.activity.count({ where })
    ]);

    res.json({
      activities,
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

// POST /api/activities
router.post('/', [
  authMiddleware,
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('type').isIn(['RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'YOGA', 'OTHER']),
  body('startTime').isISO8601(),
  body('endTime').optional().isISO8601(),
  body('duration').optional().isInt({ min: 1 }),
  body('distance').optional().isFloat({ min: 0 }),
  body('calories').optional().isInt({ min: 0 }),
  body('notes').optional().isString().isLength({ max: 1000 }),
  body('isPublic').optional().isBoolean(),
  body('workoutAssignmentId').optional().isUUID(),
  body('metrics').optional().isObject(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const {
      name,
      type,
      startTime,
      endTime,
      duration,
      distance,
      calories,
      notes,
      isPublic = false,
      workoutAssignmentId,
      metrics,
    } = req.body;

    // Calculate duration if not provided but endTime is available
    let calculatedDuration = duration;
    if (!calculatedDuration && endTime) {
      calculatedDuration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
    }

    // Verify workout assignment belongs to user
    if (workoutAssignmentId) {
      const assignment = await prisma.workoutAssignment.findUnique({
        where: { id: workoutAssignmentId },
        select: { athleteId: true, status: true }
      });

      if (!assignment || assignment.athleteId !== req.user.id) {
        throw new ForbiddenError('Asignación de entrenamiento no válida');
      }
    }

    const activity = await prisma.activity.create({
      data: {
        name,
        type,
        source: 'MANUAL',
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration: calculatedDuration,
        distance,
        calories,
        notes,
        isPublic,
        userId: req.user.id,
        workoutAssignmentId,
        metrics: metrics ? {
          create: {
            avgHeartRate: metrics.avgHeartRate,
            maxHeartRate: metrics.maxHeartRate,
            avgPower: metrics.avgPower,
            maxPower: metrics.maxPower,
            avgSpeed: metrics.avgSpeed,
            maxSpeed: metrics.maxSpeed,
            elevationGain: metrics.elevationGain,
            trainingLoad: metrics.trainingLoad,
            zones: metrics.zones,
            splits: metrics.splits,
          }
        } : undefined
      },
      select: {
        id: true,
        name: true,
        type: true,
        source: true,
        startTime: true,
        endTime: true,
        duration: true,
        distance: true,
        calories: true,
        notes: true,
        isPublic: true,
        createdAt: true,
        metrics: {
          select: {
            id: true,
            avgHeartRate: true,
            maxHeartRate: true,
            avgPower: true,
            maxPower: true,
            avgSpeed: true,
            maxSpeed: true,
            elevationGain: true,
            trainingLoad: true,
          }
        }
      }
    });

    // Update workout assignment status if applicable
    if (workoutAssignmentId) {
      await prisma.workoutAssignment.update({
        where: { id: workoutAssignmentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      });

      // Create notification for coach
      const assignment = await prisma.workoutAssignment.findUnique({
        where: { id: workoutAssignmentId },
        select: {
          coachId: true,
          template: { select: { name: true } }
        }
      });

      if (assignment) {
        await prisma.notification.create({
          data: {
            userId: assignment.coachId,
            type: 'WORKOUT_COMPLETED',
            title: 'Entrenamiento completado',
            message: `${req.user.firstName} ${req.user.lastName} ha completado el entrenamiento "${assignment.template.name}"`,
            data: {
              activityId: activity.id,
              athleteId: req.user.id,
              assignmentId: workoutAssignmentId,
            }
          }
        });
      }
    }

    logger.info('Activity created', {
      activityId: activity.id,
      userId: req.user.id,
      type,
      duration: calculatedDuration,
    });

    res.status(201).json({
      message: 'Actividad creada exitosamente',
      activity,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/activities/:activityId
router.get('/:activityId', [
  authMiddleware,
  param('activityId').isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { activityId } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        name: true,
        type: true,
        source: true,
        startTime: true,
        endTime: true,
        duration: true,
        distance: true,
        calories: true,
        notes: true,
        isPublic: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        metrics: {
          select: {
            id: true,
            avgHeartRate: true,
            maxHeartRate: true,
            avgPower: true,
            maxPower: true,
            avgSpeed: true,
            maxSpeed: true,
            elevationGain: true,
            trainingLoad: true,
            zones: true,
            splits: true,
          }
        },
        workoutAssignment: {
          select: {
            id: true,
            template: {
              select: {
                id: true,
                name: true,
                description: true,
              }
            },
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        feedback: {
          select: {
            id: true,
            category: true,
            rating: true,
            comment: true,
            isPrivate: true,
            createdAt: true,
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!activity) {
      throw new NotFoundError('Actividad no encontrada');
    }

    // Check if user can view this activity
    const canView = activity.userId === req.user.id || 
                   activity.isPublic ||
                   (req.user.role === 'COACH' && await prisma.coachAthlete.findFirst({
                     where: {
                       coachId: req.user.id,
                       athleteId: activity.userId,
                       status: 'ACTIVE',
                     }
                   }));

    if (!canView) {
      throw new ForbiddenError('No tienes permisos para ver esta actividad');
    }

    res.json({ activity });

  } catch (error) {
    throw error;
  }
});

// PUT /api/activities/:activityId
router.put('/:activityId', [
  authMiddleware,
  param('activityId').isUUID(),
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('notes').optional().isString().isLength({ max: 1000 }),
  body('isPublic').optional().isBoolean(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { activityId } = req.params;
    const { name, notes, isPublic } = req.body;

    // Check if activity exists and user owns it
    const existingActivity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true, userId: true }
    });

    if (!existingActivity) {
      throw new NotFoundError('Actividad no encontrada');
    }

    if (existingActivity.userId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para editar esta actividad');
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (notes !== undefined) updateData.notes = notes;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const activity = await prisma.activity.update({
      where: { id: activityId },
      data: updateData,
      select: {
        id: true,
        name: true,
        notes: true,
        isPublic: true,
        updatedAt: true,
      }
    });

    logger.info('Activity updated', {
      activityId,
      userId: req.user.id,
    });

    res.json({
      message: 'Actividad actualizada exitosamente',
      activity,
    });

  } catch (error) {
    throw error;
  }
});

// DELETE /api/activities/:activityId
router.delete('/:activityId', [
  authMiddleware,
  param('activityId').isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { activityId } = req.params;

    // Check if activity exists and user owns it
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { id: true, userId: true, source: true }
    });

    if (!activity) {
      throw new NotFoundError('Actividad no encontrada');
    }

    if (activity.userId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para eliminar esta actividad');
    }

    // Only allow deletion of manual activities
    if (activity.source !== 'MANUAL') {
      throw new ValidationError('Solo se pueden eliminar actividades creadas manualmente');
    }

    await prisma.activity.delete({
      where: { id: activityId }
    });

    logger.info('Activity deleted', {
      activityId,
      userId: req.user.id,
    });

    res.json({
      message: 'Actividad eliminada exitosamente',
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/activities/stats/:userId?
router.get('/stats/:userId?', [
  authMiddleware,
  param('userId').optional().isUUID(),
  query('period').optional().isIn(['week', 'month', 'year']),
  query('type').optional().isIn(['RUNNING', 'CYCLING', 'SWIMMING', 'STRENGTH', 'YOGA', 'OTHER']),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const targetUserId = req.params.userId || req.user.id;
    const period = req.query.period as string || 'month';
    const type = req.query.type as string;

    // Check if user can view stats for the specified userId
    if (targetUserId !== req.user.id) {
      if (req.user.role === 'COACH') {
        const relationship = await prisma.coachAthlete.findFirst({
          where: {
            coachId: req.user.id,
            athleteId: targetUserId,
            status: 'ACTIVE',
          }
        });
        if (!relationship) {
          throw new ForbiddenError('No tienes permisos para ver las estadísticas de este usuario');
        }
      } else {
        throw new ForbiddenError('No tienes permisos para ver las estadísticas de este usuario');
      }
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const where: any = {
      userId: targetUserId,
      startTime: {
        gte: startDate,
        lte: now,
      }
    };

    if (type) {
      where.type = type;
    }

    const [activities, totalStats] = await Promise.all([
      prisma.activity.findMany({
        where,
        select: {
          id: true,
          type: true,
          duration: true,
          distance: true,
          calories: true,
          startTime: true,
          metrics: {
            select: {
              trainingLoad: true,
              avgHeartRate: true,
            }
          }
        }
      }),
      prisma.activity.aggregate({
        where,
        _count: { id: true },
        _sum: {
          duration: true,
          distance: true,
          calories: true,
        },
        _avg: {
          duration: true,
          distance: true,
          calories: true,
        }
      })
    ]);

    // Group activities by type
    const byType = activities.reduce((acc: any, activity) => {
      if (!acc[activity.type]) {
        acc[activity.type] = {
          count: 0,
          totalDuration: 0,
          totalDistance: 0,
          totalCalories: 0,
        };
      }
      acc[activity.type].count++;
      acc[activity.type].totalDuration += activity.duration || 0;
      acc[activity.type].totalDistance += activity.distance || 0;
      acc[activity.type].totalCalories += activity.calories || 0;
      return acc;
    }, {});

    // Group activities by week/day for trends
    const timeGrouped = activities.reduce((acc: any, activity) => {
      const date = activity.startTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          duration: 0,
          distance: 0,
          calories: 0,
        };
      }
      acc[date].count++;
      acc[date].duration += activity.duration || 0;
      acc[date].distance += activity.distance || 0;
      acc[date].calories += activity.calories || 0;
      return acc;
    }, {});

    // Calculate training load average
    const activitiesWithLoad = activities.filter(a => a.metrics?.trainingLoad);
    const avgTrainingLoad = activitiesWithLoad.length > 0 
      ? activitiesWithLoad.reduce((sum, a) => sum + (a.metrics?.trainingLoad || 0), 0) / activitiesWithLoad.length
      : 0;

    // Calculate average heart rate
    const activitiesWithHR = activities.filter(a => a.metrics?.avgHeartRate);
    const avgHeartRate = activitiesWithHR.length > 0
      ? activitiesWithHR.reduce((sum, a) => sum + (a.metrics?.avgHeartRate || 0), 0) / activitiesWithHR.length
      : 0;

    const stats = {
      period,
      dateRange: {
        start: startDate,
        end: now,
      },
      totals: {
        activities: totalStats._count.id,
        duration: totalStats._sum.duration || 0,
        distance: totalStats._sum.distance || 0,
        calories: totalStats._sum.calories || 0,
      },
      averages: {
        duration: Math.round(totalStats._avg.duration || 0),
        distance: Math.round((totalStats._avg.distance || 0) * 100) / 100,
        calories: Math.round(totalStats._avg.calories || 0),
        trainingLoad: Math.round(avgTrainingLoad * 10) / 10,
        heartRate: Math.round(avgHeartRate),
      },
      byType,
      timeline: timeGrouped,
    };

    res.json({ stats });

  } catch (error) {
    throw error;
  }
});

export default router;
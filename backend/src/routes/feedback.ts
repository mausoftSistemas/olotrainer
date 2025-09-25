import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ValidationError, NotFoundError, ForbiddenError } from '@/middleware/errorHandler';
import { authMiddleware, requireCoach, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// Helper function to validate request
const validateRequest = (req: express.Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
};

// POST /api/feedback
router.post('/', [
  authMiddleware,
  requireCoach,
  body('activityId').isUUID(),
  body('category').isIn(['TECHNIQUE', 'PERFORMANCE', 'MOTIVATION', 'RECOVERY', 'NUTRITION', 'GENERAL']),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').trim().isLength({ min: 1, max: 1000 }),
  body('isPrivate').optional().isBoolean(),
  body('recommendations').optional().isArray(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { activityId, category, rating, comment, isPrivate = false, recommendations } = req.body;

    // Verify activity exists and coach has permission to give feedback
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: {
        id: true,
        userId: true,
        name: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!activity) {
      throw new NotFoundError('Actividad no encontrada');
    }

    // Check if coach has relationship with athlete
    const relationship = await prisma.coachAthlete.findFirst({
      where: {
        coachId: req.user.id,
        athleteId: activity.userId,
        status: 'ACTIVE',
      }
    });

    if (!relationship) {
      throw new ForbiddenError('No tienes permisos para dar feedback a este atleta');
    }

    // Check if feedback already exists for this activity from this coach
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        activityId,
        coachId: req.user.id,
      }
    });

    if (existingFeedback) {
      throw new ValidationError('Ya has dado feedback para esta actividad');
    }

    const feedback = await prisma.feedback.create({
      data: {
        activityId,
        coachId: req.user.id,
        athleteId: activity.userId,
        category,
        rating,
        comment,
        isPrivate,
        recommendations,
      },
      select: {
        id: true,
        category: true,
        rating: true,
        comment: true,
        isPrivate: true,
        recommendations: true,
        createdAt: true,
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        activity: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      }
    });

    // Create notification for athlete (if feedback is not private)
    if (!isPrivate) {
      await prisma.notification.create({
        data: {
          userId: activity.userId,
          type: 'FEEDBACK_RECEIVED',
          title: 'Nuevo feedback recibido',
          message: `${req.user.firstName} ${req.user.lastName} ha dejado feedback en tu actividad "${activity.name}"`,
          data: {
            feedbackId: feedback.id,
            activityId,
            coachId: req.user.id,
            category,
          }
        }
      });
    }

    logger.info('Feedback created', {
      feedbackId: feedback.id,
      coachId: req.user.id,
      athleteId: activity.userId,
      activityId,
      category,
    });

    res.status(201).json({
      message: 'Feedback creado exitosamente',
      feedback,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/feedback
router.get('/', [
  authMiddleware,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('activityId').optional().isUUID(),
  query('athleteId').optional().isUUID(),
  query('category').optional().isIn(['TECHNIQUE', 'PERFORMANCE', 'MOTIVATION', 'RECOVERY', 'NUTRITION', 'GENERAL']),
  query('rating').optional().isInt({ min: 1, max: 5 }),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const activityId = req.query.activityId as string;
    const athleteId = req.query.athleteId as string;
    const category = req.query.category as string;
    const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter based on user role
    if (req.user.role === 'COACH') {
      where.coachId = req.user.id;
      if (athleteId) {
        // Verify coach has relationship with athlete
        const relationship = await prisma.coachAthlete.findFirst({
          where: {
            coachId: req.user.id,
            athleteId,
            status: 'ACTIVE',
          }
        });
        if (!relationship) {
          throw new ForbiddenError('No tienes permisos para ver el feedback de este atleta');
        }
        where.athleteId = athleteId;
      }
    } else {
      // Athletes can only see their own feedback
      where.athleteId = req.user.id;
      // Athletes can only see non-private feedback
      where.isPrivate = false;
    }

    if (activityId) {
      where.activityId = activityId;
    }

    if (category) {
      where.category = category;
    }

    if (rating !== undefined) {
      where.rating = rating;
    }

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          category: true,
          rating: true,
          comment: true,
          isPrivate: true,
          recommendations: true,
          createdAt: true,
          coach: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
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
          activity: {
            select: {
              id: true,
              name: true,
              type: true,
              startTime: true,
              duration: true,
              distance: true,
            }
          }
        }
      }),
      prisma.feedback.count({ where })
    ]);

    res.json({
      feedbacks,
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

// GET /api/feedback/:feedbackId
router.get('/:feedbackId', [
  authMiddleware,
  param('feedbackId').isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { feedbackId } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      select: {
        id: true,
        category: true,
        rating: true,
        comment: true,
        isPrivate: true,
        recommendations: true,
        createdAt: true,
        updatedAt: true,
        coachId: true,
        athleteId: true,
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
        activity: {
          select: {
            id: true,
            name: true,
            type: true,
            startTime: true,
            duration: true,
            distance: true,
            calories: true,
            notes: true,
          }
        }
      }
    });

    if (!feedback) {
      throw new NotFoundError('Feedback no encontrado');
    }

    // Check permissions
    const canView = feedback.coachId === req.user.id || 
                   (feedback.athleteId === req.user.id && !feedback.isPrivate);

    if (!canView) {
      throw new ForbiddenError('No tienes permisos para ver este feedback');
    }

    res.json({ feedback });

  } catch (error) {
    throw error;
  }
});

// PUT /api/feedback/:feedbackId
router.put('/:feedbackId', [
  authMiddleware,
  requireCoach,
  param('feedbackId').isUUID(),
  body('category').optional().isIn(['TECHNIQUE', 'PERFORMANCE', 'MOTIVATION', 'RECOVERY', 'NUTRITION', 'GENERAL']),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ min: 1, max: 1000 }),
  body('isPrivate').optional().isBoolean(),
  body('recommendations').optional().isArray(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { feedbackId } = req.params;
    const { category, rating, comment, isPrivate, recommendations } = req.body;

    // Check if feedback exists and coach owns it
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      select: { id: true, coachId: true, athleteId: true, isPrivate: true }
    });

    if (!existingFeedback) {
      throw new NotFoundError('Feedback no encontrado');
    }

    if (existingFeedback.coachId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para editar este feedback');
    }

    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (recommendations !== undefined) updateData.recommendations = recommendations;

    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: updateData,
      select: {
        id: true,
        category: true,
        rating: true,
        comment: true,
        isPrivate: true,
        recommendations: true,
        updatedAt: true,
      }
    });

    // If feedback visibility changed from private to public, create notification
    if (existingFeedback.isPrivate && isPrivate === false) {
      await prisma.notification.create({
        data: {
          userId: existingFeedback.athleteId,
          type: 'FEEDBACK_RECEIVED',
          title: 'Feedback actualizado',
          message: `${req.user.firstName} ${req.user.lastName} ha actualizado su feedback`,
          data: {
            feedbackId: feedback.id,
            coachId: req.user.id,
          }
        }
      });
    }

    logger.info('Feedback updated', {
      feedbackId,
      coachId: req.user.id,
    });

    res.json({
      message: 'Feedback actualizado exitosamente',
      feedback,
    });

  } catch (error) {
    throw error;
  }
});

// DELETE /api/feedback/:feedbackId
router.delete('/:feedbackId', [
  authMiddleware,
  requireCoach,
  param('feedbackId').isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { feedbackId } = req.params;

    // Check if feedback exists and coach owns it
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      select: { id: true, coachId: true }
    });

    if (!feedback) {
      throw new NotFoundError('Feedback no encontrado');
    }

    if (feedback.coachId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para eliminar este feedback');
    }

    await prisma.feedback.delete({
      where: { id: feedbackId }
    });

    logger.info('Feedback deleted', {
      feedbackId,
      coachId: req.user.id,
    });

    res.json({
      message: 'Feedback eliminado exitosamente',
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/feedback/stats/:athleteId?
router.get('/stats/:athleteId?', [
  authMiddleware,
  param('athleteId').optional().isUUID(),
  query('period').optional().isIn(['week', 'month', 'year']),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const targetAthleteId = req.params.athleteId;
    const period = req.query.period as string || 'month';

    let athleteId: string;

    if (req.user.role === 'COACH') {
      if (!targetAthleteId) {
        throw new ValidationError('athleteId es requerido para entrenadores');
      }
      
      // Verify coach has relationship with athlete
      const relationship = await prisma.coachAthlete.findFirst({
        where: {
          coachId: req.user.id,
          athleteId: targetAthleteId,
          status: 'ACTIVE',
        }
      });

      if (!relationship) {
        throw new ForbiddenError('No tienes permisos para ver las estadísticas de este atleta');
      }

      athleteId = targetAthleteId;
    } else {
      // Athletes can only see their own stats
      athleteId = req.user.id;
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

    const where = {
      athleteId,
      createdAt: {
        gte: startDate,
        lte: now,
      },
      ...(req.user.role === 'ATHLETE' ? { isPrivate: false } : {})
    };

    const [feedbacks, categoryStats, ratingStats] = await Promise.all([
      prisma.feedback.findMany({
        where,
        select: {
          id: true,
          category: true,
          rating: true,
          createdAt: true,
        }
      }),
      prisma.feedback.groupBy({
        by: ['category'],
        where,
        _count: { id: true },
        _avg: { rating: true },
      }),
      prisma.feedback.groupBy({
        by: ['rating'],
        where,
        _count: { id: true },
      })
    ]);

    // Calculate trends over time
    const timeGrouped = feedbacks.reduce((acc: any, feedback) => {
      const date = feedback.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          totalRating: 0,
          avgRating: 0,
        };
      }
      acc[date].count++;
      acc[date].totalRating += feedback.rating || 0;
      acc[date].avgRating = acc[date].totalRating / acc[date].count;
      return acc;
    }, {});

    const stats = {
      period,
      dateRange: {
        start: startDate,
        end: now,
      },
      totals: {
        feedbacks: feedbacks.length,
        avgRating: feedbacks.length > 0 
          ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter(f => f.rating).length
          : 0,
      },
      byCategory: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.id,
        avgRating: Math.round((stat._avg.rating || 0) * 10) / 10,
      })),
      byRating: ratingStats.map(stat => ({
        rating: stat.rating,
        count: stat._count.id,
      })),
      timeline: timeGrouped,
    };

    res.json({ stats });

  } catch (error) {
    throw error;
  }
});

export default router;
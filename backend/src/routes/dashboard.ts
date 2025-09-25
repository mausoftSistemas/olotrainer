import express from 'express';
import { query, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ValidationError } from '@/middleware/errorHandler';
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

// Helper function to get date range
const getDateRange = (period: string) => {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }

  return { startDate, endDate: now };
};

// GET /api/dashboard/overview
router.get('/overview', [
  authMiddleware,
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const period = req.query.period as string || 'month';
    const { startDate, endDate } = getDateRange(period);

    if (req.user.role === 'COACH') {
      // Coach dashboard overview
      const [
        athletesCount,
        activeAthletes,
        totalWorkouts,
        completedWorkouts,
        pendingFeedbacks,
        recentActivities,
        workoutTemplates,
        unreadMessages
      ] = await Promise.all([
        // Total athletes
        prisma.coachAthlete.count({
          where: {
            coachId: req.user.id,
            status: 'ACTIVE'
          }
        }),
        
        // Active athletes (with activities in period)
        prisma.coachAthlete.count({
          where: {
            coachId: req.user.id,
            status: 'ACTIVE',
            athlete: {
              activities: {
                some: {
                  startTime: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              }
            }
          }
        }),

        // Total workouts assigned in period
        prisma.workoutAssignment.count({
          where: {
            workout: {
              template: {
                coachId: req.user.id
              }
            },
            assignedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),

        // Completed workouts in period
        prisma.workoutAssignment.count({
          where: {
            workout: {
              template: {
                coachId: req.user.id
              }
            },
            status: 'COMPLETED',
            assignedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),

        // Pending feedbacks
        prisma.activity.count({
          where: {
            user: {
              coachAthletes: {
                some: {
                  coachId: req.user.id,
                  status: 'ACTIVE'
                }
              }
            },
            startTime: {
              gte: startDate,
              lte: endDate
            },
            feedback: null
          }
        }),

        // Recent activities from athletes
        prisma.activity.findMany({
          where: {
            user: {
              coachAthletes: {
                some: {
                  coachId: req.user.id,
                  status: 'ACTIVE'
                }
              }
            },
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          take: 10,
          orderBy: { startTime: 'desc' },
          select: {
            id: true,
            name: true,
            type: true,
            startTime: true,
            duration: true,
            distance: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }),

        // Workout templates count
        prisma.workoutTemplate.count({
          where: { coachId: req.user.id }
        }),

        // Unread messages
        prisma.message.count({
          where: {
            recipientId: req.user.id,
            isRead: false
          }
        })
      ]);

      const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

      res.json({
        overview: {
          athletesCount,
          activeAthletes,
          totalWorkouts,
          completedWorkouts,
          completionRate: Math.round(completionRate * 100) / 100,
          pendingFeedbacks,
          workoutTemplates,
          unreadMessages,
        },
        recentActivities,
        period,
      });

    } else {
      // Athlete dashboard overview
      const [
        totalActivities,
        totalDistance,
        totalDuration,
        totalCalories,
        assignedWorkouts,
        completedWorkouts,
        pendingWorkouts,
        recentActivities,
        unreadMessages,
        coachInfo
      ] = await Promise.all([
        // Total activities in period
        prisma.activity.count({
          where: {
            userId: req.user.id,
            startTime: {
              gte: startDate,
              lte: endDate
            }
          }
        }),

        // Total distance
        prisma.activity.aggregate({
          where: {
            userId: req.user.id,
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: { distance: true }
        }),

        // Total duration
        prisma.activity.aggregate({
          where: {
            userId: req.user.id,
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: { duration: true }
        }),

        // Total calories
        prisma.activity.aggregate({
          where: {
            userId: req.user.id,
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: { calories: true }
        }),

        // Assigned workouts in period
        prisma.workoutAssignment.count({
          where: {
            athleteId: req.user.id,
            assignedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),

        // Completed workouts
        prisma.workoutAssignment.count({
          where: {
            athleteId: req.user.id,
            status: 'COMPLETED',
            assignedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),

        // Pending workouts
        prisma.workoutAssignment.count({
          where: {
            athleteId: req.user.id,
            status: 'PENDING',
            dueDate: {
              gte: new Date()
            }
          }
        }),

        // Recent activities
        prisma.activity.findMany({
          where: {
            userId: req.user.id,
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          take: 10,
          orderBy: { startTime: 'desc' },
          select: {
            id: true,
            name: true,
            type: true,
            startTime: true,
            duration: true,
            distance: true,
            calories: true,
            feedback: {
              select: {
                id: true,
                rating: true,
                category: true
              }
            }
          }
        }),

        // Unread messages
        prisma.message.count({
          where: {
            recipientId: req.user.id,
            isRead: false
          }
        }),

        // Coach information
        prisma.coachAthlete.findFirst({
          where: {
            athleteId: req.user.id,
            status: 'ACTIVE'
          },
          select: {
            coach: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                profile: {
                  select: {
                    specialization: true,
                    experience: true
                  }
                }
              }
            }
          }
        })
      ]);

      const completionRate = assignedWorkouts > 0 ? (completedWorkouts / assignedWorkouts) * 100 : 0;
      const avgDistance = totalActivities > 0 ? (totalDistance._sum.distance || 0) / totalActivities : 0;
      const avgDuration = totalActivities > 0 ? (totalDuration._sum.duration || 0) / totalActivities : 0;

      res.json({
        overview: {
          totalActivities,
          totalDistance: totalDistance._sum.distance || 0,
          totalDuration: totalDuration._sum.duration || 0,
          totalCalories: totalCalories._sum.calories || 0,
          avgDistance: Math.round(avgDistance * 100) / 100,
          avgDuration: Math.round(avgDuration),
          assignedWorkouts,
          completedWorkouts,
          pendingWorkouts,
          completionRate: Math.round(completionRate * 100) / 100,
          unreadMessages,
        },
        recentActivities,
        coach: coachInfo?.coach || null,
        period,
      });
    }

  } catch (error) {
    throw error;
  }
});

// GET /api/dashboard/stats
router.get('/stats', [
  authMiddleware,
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
  query('type').optional().isIn(['activities', 'workouts', 'performance']),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const period = req.query.period as string || 'month';
    const type = req.query.type as string || 'activities';
    const { startDate, endDate } = getDateRange(period);

    if (req.user.role === 'COACH') {
      // Coach statistics
      if (type === 'activities') {
        // Activities statistics from all athletes
        const activitiesStats = await prisma.activity.groupBy({
          by: ['type'],
          where: {
            user: {
              coachAthletes: {
                some: {
                  coachId: req.user.id,
                  status: 'ACTIVE'
                }
              }
            },
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: { id: true },
          _sum: {
            distance: true,
            duration: true,
            calories: true
          },
          _avg: {
            distance: true,
            duration: true
          }
        });

        res.json({ stats: activitiesStats, type, period });

      } else if (type === 'workouts') {
        // Workout assignment statistics
        const workoutStats = await prisma.workoutAssignment.groupBy({
          by: ['status'],
          where: {
            workout: {
              template: {
                coachId: req.user.id
              }
            },
            assignedAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: { id: true }
        });

        res.json({ stats: workoutStats, type, period });

      } else {
        // Performance statistics
        const performanceStats = await prisma.feedback.groupBy({
          by: ['rating'],
          where: {
            coachId: req.user.id,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: { id: true }
        });

        res.json({ stats: performanceStats, type, period });
      }

    } else {
      // Athlete statistics
      if (type === 'activities') {
        const activitiesStats = await prisma.activity.groupBy({
          by: ['type'],
          where: {
            userId: req.user.id,
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: { id: true },
          _sum: {
            distance: true,
            duration: true,
            calories: true
          },
          _avg: {
            distance: true,
            duration: true
          }
        });

        res.json({ stats: activitiesStats, type, period });

      } else if (type === 'workouts') {
        const workoutStats = await prisma.workoutAssignment.groupBy({
          by: ['status'],
          where: {
            athleteId: req.user.id,
            assignedAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: { id: true }
        });

        res.json({ stats: workoutStats, type, period });

      } else {
        // Performance statistics (feedback received)
        const performanceStats = await prisma.feedback.groupBy({
          by: ['rating'],
          where: {
            activity: {
              userId: req.user.id
            },
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _count: { id: true }
        });

        res.json({ stats: performanceStats, type, period });
      }
    }

  } catch (error) {
    throw error;
  }
});

// GET /api/dashboard/timeline
router.get('/timeline', [
  authMiddleware,
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
  query('granularity').optional().isIn(['day', 'week', 'month']),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const period = req.query.period as string || 'month';
    const granularity = req.query.granularity as string || 'day';
    const { startDate, endDate } = getDateRange(period);

    // Generate timeline data based on granularity
    const timelineData = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const periodStart = new Date(current);
      const periodEnd = new Date(current);

      if (granularity === 'day') {
        periodEnd.setDate(periodEnd.getDate() + 1);
      } else if (granularity === 'week') {
        periodEnd.setDate(periodEnd.getDate() + 7);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      let data;
      if (req.user.role === 'COACH') {
        // Coach timeline: activities from all athletes
        data = await prisma.activity.aggregate({
          where: {
            user: {
              coachAthletes: {
                some: {
                  coachId: req.user.id,
                  status: 'ACTIVE'
                }
              }
            },
            startTime: {
              gte: periodStart,
              lt: periodEnd
            }
          },
          _count: { id: true },
          _sum: {
            distance: true,
            duration: true,
            calories: true
          }
        });
      } else {
        // Athlete timeline: own activities
        data = await prisma.activity.aggregate({
          where: {
            userId: req.user.id,
            startTime: {
              gte: periodStart,
              lt: periodEnd
            }
          },
          _count: { id: true },
          _sum: {
            distance: true,
            duration: true,
            calories: true
          }
        });
      }

      timelineData.push({
        date: periodStart.toISOString().split('T')[0],
        activities: data._count.id,
        distance: data._sum.distance || 0,
        duration: data._sum.duration || 0,
        calories: data._sum.calories || 0,
      });

      if (granularity === 'day') {
        current.setDate(current.getDate() + 1);
      } else if (granularity === 'week') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    res.json({
      timeline: timelineData,
      period,
      granularity,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/dashboard/athletes (Coach only)
router.get('/athletes', [
  authMiddleware,
  requireCoach,
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']),
  query('sortBy').optional().isIn(['activities', 'distance', 'duration', 'lastActivity']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const period = req.query.period as string || 'month';
    const sortBy = req.query.sortBy as string || 'activities';
    const limit = parseInt(req.query.limit as string) || 10;
    const { startDate, endDate } = getDateRange(period);

    // Get athletes with their statistics
    const athletes = await prisma.coachAthlete.findMany({
      where: {
        coachId: req.user.id,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        createdAt: true,
        athlete: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            profile: {
              select: {
                dateOfBirth: true,
                gender: true,
                fitnessLevel: true
              }
            },
            activities: {
              where: {
                startTime: {
                  gte: startDate,
                  lte: endDate
                }
              },
              select: {
                id: true,
                distance: true,
                duration: true,
                calories: true,
                startTime: true
              }
            },
            workoutAssignments: {
              where: {
                assignedAt: {
                  gte: startDate,
                  lte: endDate
                }
              },
              select: {
                id: true,
                status: true
              }
            }
          }
        }
      },
      take: limit
    });

    // Calculate statistics for each athlete
    const athletesWithStats = athletes.map(relation => {
      const athlete = relation.athlete;
      const activities = athlete.activities;
      const assignments = athlete.workoutAssignments;

      const totalActivities = activities.length;
      const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0);
      const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
      const totalCalories = activities.reduce((sum, a) => sum + (a.calories || 0), 0);
      const lastActivity = activities.length > 0 
        ? Math.max(...activities.map(a => new Date(a.startTime).getTime()))
        : null;

      const completedWorkouts = assignments.filter(a => a.status === 'COMPLETED').length;
      const totalWorkouts = assignments.length;
      const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

      return {
        id: athlete.id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        avatar: athlete.avatar,
        profile: athlete.profile,
        relationshipStart: relation.createdAt,
        stats: {
          totalActivities,
          totalDistance: Math.round(totalDistance * 100) / 100,
          totalDuration,
          totalCalories,
          avgDistance: totalActivities > 0 ? Math.round((totalDistance / totalActivities) * 100) / 100 : 0,
          avgDuration: totalActivities > 0 ? Math.round(totalDuration / totalActivities) : 0,
          lastActivity: lastActivity ? new Date(lastActivity).toISOString() : null,
          completedWorkouts,
          totalWorkouts,
          completionRate: Math.round(completionRate * 100) / 100,
        }
      };
    });

    // Sort athletes based on sortBy parameter
    athletesWithStats.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return b.stats.totalDistance - a.stats.totalDistance;
        case 'duration':
          return b.stats.totalDuration - a.stats.totalDuration;
        case 'lastActivity':
          const aTime = a.stats.lastActivity ? new Date(a.stats.lastActivity).getTime() : 0;
          const bTime = b.stats.lastActivity ? new Date(b.stats.lastActivity).getTime() : 0;
          return bTime - aTime;
        default: // activities
          return b.stats.totalActivities - a.stats.totalActivities;
      }
    });

    res.json({
      athletes: athletesWithStats,
      period,
      sortBy,
    });

  } catch (error) {
    throw error;
  }
});

// GET /api/dashboard/notifications
router.get('/notifications', [
  authMiddleware,
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('unreadOnly').optional().isBoolean(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const unreadOnly = req.query.unreadOnly === 'true';

    const where: any = { userId: req.user.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          data: true,
          isRead: true,
          createdAt: true,
        }
      }),
      prisma.notification.count({
        where: {
          userId: req.user.id,
          isRead: false
        }
      })
    ]);

    res.json({
      notifications,
      unreadCount,
    });

  } catch (error) {
    throw error;
  }
});

export default router;
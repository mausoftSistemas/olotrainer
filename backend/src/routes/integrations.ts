import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { ValidationError, NotFoundError, ForbiddenError, BadRequestError } from '@/middleware/errorHandler';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// Helper function to validate request
const validateRequest = (req: express.Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    throw new ValidationError(errorMessages);
  }
};

// GET /api/integrations
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const integrations = await prisma.userIntegration.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        provider: true,
        isActive: true,
        lastSync: true,
        syncSettings: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add available providers info
    const availableProviders = [
      {
        provider: 'STRAVA',
        name: 'Strava',
        description: 'Sincroniza actividades de running, ciclismo y más',
        icon: 'strava',
        isConnected: integrations.some(i => i.provider === 'STRAVA' && i.isActive),
      },
      {
        provider: 'GARMIN',
        name: 'Garmin Connect',
        description: 'Importa datos de dispositivos Garmin',
        icon: 'garmin',
        isConnected: integrations.some(i => i.provider === 'GARMIN' && i.isActive),
      },
      {
        provider: 'POLAR',
        name: 'Polar Flow',
        description: 'Conecta con dispositivos Polar',
        icon: 'polar',
        isConnected: integrations.some(i => i.provider === 'POLAR' && i.isActive),
      },
      {
        provider: 'FITBIT',
        name: 'Fitbit',
        description: 'Sincroniza datos de actividad y salud',
        icon: 'fitbit',
        isConnected: integrations.some(i => i.provider === 'FITBIT' && i.isActive),
      },
      {
        provider: 'SUUNTO',
        name: 'Suunto',
        description: 'Importa entrenamientos de Suunto App',
        icon: 'suunto',
        isConnected: integrations.some(i => i.provider === 'SUUNTO' && i.isActive),
      }
    ];

    res.json({
      integrations,
      availableProviders,
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/integrations/connect
router.post('/connect', [
  authMiddleware,
  body('provider').isIn(['STRAVA', 'GARMIN', 'POLAR', 'FITBIT', 'SUUNTO']),
  body('authCode').optional().isString(),
  body('accessToken').optional().isString(),
  body('refreshToken').optional().isString(),
  body('externalUserId').optional().isString(),
  body('syncSettings').optional().isObject(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { 
      provider, 
      authCode, 
      accessToken, 
      refreshToken, 
      externalUserId,
      syncSettings = {}
    } = req.body;

    // Check if integration already exists
    const existingIntegration = await prisma.userIntegration.findFirst({
      where: {
        userId: req.user.id,
        provider,
      }
    });

    if (existingIntegration) {
      // Update existing integration
      const updatedIntegration = await prisma.userIntegration.update({
        where: { id: existingIntegration.id },
        data: {
          isActive: true,
          accessToken,
          refreshToken,
          externalUserId,
          syncSettings,
          lastSync: null, // Reset last sync
          updatedAt: new Date(),
        },
        select: {
          id: true,
          provider: true,
          isActive: true,
          syncSettings: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      logger.info('Integration updated', {
        userId: req.user.id,
        provider,
        integrationId: updatedIntegration.id,
      });

      return res.json({
        message: 'Integración actualizada exitosamente',
        integration: updatedIntegration,
      });
    }

    // Create new integration
    const integration = await prisma.userIntegration.create({
      data: {
        userId: req.user.id,
        provider,
        isActive: true,
        accessToken,
        refreshToken,
        externalUserId,
        syncSettings,
      },
      select: {
        id: true,
        provider: true,
        isActive: true,
        syncSettings: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'INTEGRATION_CONNECTED',
        title: 'Integración conectada',
        message: `Tu cuenta de ${provider} ha sido conectada exitosamente`,
        data: {
          provider,
          integrationId: integration.id,
        }
      }
    });

    logger.info('New integration created', {
      userId: req.user.id,
      provider,
      integrationId: integration.id,
    });

    res.status(201).json({
      message: 'Integración creada exitosamente',
      integration,
    });

  } catch (error) {
    throw error;
  }
});

// PUT /api/integrations/:integrationId
router.put('/:integrationId', [
  authMiddleware,
  param('integrationId').isUUID(),
  body('isActive').optional().isBoolean(),
  body('syncSettings').optional().isObject(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { integrationId } = req.params;
    const { isActive, syncSettings } = req.body;

    // Check if integration exists and belongs to user
    const integration = await prisma.userIntegration.findUnique({
      where: { id: integrationId },
      select: {
        id: true,
        userId: true,
        provider: true,
        isActive: true,
      }
    });

    if (!integration) {
      throw new NotFoundError('Integración no encontrada');
    }

    if (integration.userId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para modificar esta integración');
    }

    const updateData: any = {};
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    if (syncSettings) {
      updateData.syncSettings = syncSettings;
    }

    const updatedIntegration = await prisma.userIntegration.update({
      where: { id: integrationId },
      data: updateData,
      select: {
        id: true,
        provider: true,
        isActive: true,
        syncSettings: true,
        lastSync: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    logger.info('Integration updated', {
      userId: req.user.id,
      integrationId,
      provider: integration.provider,
      changes: updateData,
    });

    res.json({
      message: 'Integración actualizada exitosamente',
      integration: updatedIntegration,
    });

  } catch (error) {
    throw error;
  }
});

// DELETE /api/integrations/:integrationId
router.delete('/:integrationId', [
  authMiddleware,
  param('integrationId').isUUID(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { integrationId } = req.params;

    // Check if integration exists and belongs to user
    const integration = await prisma.userIntegration.findUnique({
      where: { id: integrationId },
      select: {
        id: true,
        userId: true,
        provider: true,
      }
    });

    if (!integration) {
      throw new NotFoundError('Integración no encontrada');
    }

    if (integration.userId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para eliminar esta integración');
    }

    await prisma.userIntegration.delete({
      where: { id: integrationId }
    });

    logger.info('Integration deleted', {
      userId: req.user.id,
      integrationId,
      provider: integration.provider,
    });

    res.json({
      message: 'Integración eliminada exitosamente',
    });

  } catch (error) {
    throw error;
  }
});

// POST /api/integrations/:integrationId/sync
router.post('/:integrationId/sync', [
  authMiddleware,
  param('integrationId').isUUID(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('forceSync').optional().isBoolean(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { integrationId } = req.params;
    const { startDate, endDate, forceSync = false } = req.body;

    // Check if integration exists and belongs to user
    const integration = await prisma.userIntegration.findUnique({
      where: { id: integrationId },
      select: {
        id: true,
        userId: true,
        provider: true,
        isActive: true,
        lastSync: true,
        accessToken: true,
        refreshToken: true,
        externalUserId: true,
        syncSettings: true,
      }
    });

    if (!integration) {
      throw new NotFoundError('Integración no encontrada');
    }

    if (integration.userId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para sincronizar esta integración');
    }

    if (!integration.isActive) {
      throw new BadRequestError('La integración no está activa');
    }

    // Check if sync is already in progress (prevent multiple simultaneous syncs)
    const recentSync = integration.lastSync && 
      new Date().getTime() - new Date(integration.lastSync).getTime() < 60000; // 1 minute

    if (recentSync && !forceSync) {
      throw new BadRequestError('Sincronización reciente detectada. Espera un momento antes de sincronizar nuevamente.');
    }

    // Update last sync timestamp
    await prisma.userIntegration.update({
      where: { id: integrationId },
      data: { lastSync: new Date() }
    });

    // Here you would implement the actual sync logic for each provider
    // For now, we'll simulate a successful sync
    const syncResult = await simulateSync(integration, startDate, endDate);

    // Create notification about sync result
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: 'SYNC_COMPLETED',
        title: 'Sincronización completada',
        message: `Se han sincronizado ${syncResult.activitiesCount} actividades desde ${integration.provider}`,
        data: {
          provider: integration.provider,
          integrationId,
          activitiesCount: syncResult.activitiesCount,
          syncDuration: syncResult.duration,
        }
      }
    });

    logger.info('Integration sync completed', {
      userId: req.user.id,
      integrationId,
      provider: integration.provider,
      activitiesCount: syncResult.activitiesCount,
      duration: syncResult.duration,
    });

    res.json({
      message: 'Sincronización completada exitosamente',
      result: syncResult,
    });

  } catch (error) {
    // Update integration to clear the sync timestamp on error
    if (req.params.integrationId) {
      await prisma.userIntegration.update({
        where: { id: req.params.integrationId },
        data: { lastSync: null }
      }).catch(() => {}); // Ignore errors here
    }
    throw error;
  }
});

// GET /api/integrations/:integrationId/activities
router.get('/:integrationId/activities', [
  authMiddleware,
  param('integrationId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { integrationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const skip = (page - 1) * limit;

    // Check if integration exists and belongs to user
    const integration = await prisma.userIntegration.findUnique({
      where: { id: integrationId },
      select: {
        id: true,
        userId: true,
        provider: true,
      }
    });

    if (!integration) {
      throw new NotFoundError('Integración no encontrada');
    }

    if (integration.userId !== req.user.id) {
      throw new ForbiddenError('No tienes permisos para ver las actividades de esta integración');
    }

    const where: any = {
      userId: req.user.id,
      source: integration.provider,
    };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
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
          isPublic: true,
          createdAt: true,
          metrics: {
            select: {
              id: true,
              avgHeartRate: true,
              maxHeartRate: true,
              avgPower: true,
              maxPower: true,
              elevationGain: true,
              avgPace: true,
              maxSpeed: true,
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
      },
      integration: {
        id: integration.id,
        provider: integration.provider,
      }
    });

  } catch (error) {
    throw error;
  }
});

// Helper function to simulate sync (replace with actual implementation)
async function simulateSync(integration: any, startDate?: string, endDate?: string) {
  const startTime = Date.now();
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate creating some activities
  const activitiesCount = Math.floor(Math.random() * 10) + 1;
  
  // In a real implementation, you would:
  // 1. Make API calls to the external service
  // 2. Parse the response data
  // 3. Create Activity and ActivityMetrics records
  // 4. Handle errors and rate limiting
  
  const duration = Date.now() - startTime;
  
  return {
    activitiesCount,
    duration,
    success: true,
    syncedPeriod: {
      startDate: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: endDate || new Date().toISOString(),
    }
  };
}

// GET /api/integrations/oauth/:provider/url
router.get('/oauth/:provider/url', [
  authMiddleware,
  param('provider').isIn(['STRAVA', 'GARMIN', 'POLAR', 'FITBIT', 'SUUNTO']),
], async (req: AuthenticatedRequest, res) => {
  try {
    validateRequest(req);

    if (!req.user) {
      throw new Error('Usuario no autenticado');
    }

    const { provider } = req.params;

    // Generate OAuth URLs for different providers
    const oauthUrls: Record<string, string> = {
      STRAVA: `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.STRAVA_REDIRECT_URI || '')}&approval_prompt=force&scope=read,activity:read_all`,
      GARMIN: `https://connect.garmin.com/oauthConfirm?oauth_callback=${encodeURIComponent(process.env.GARMIN_REDIRECT_URI || '')}`,
      POLAR: `https://flow.polar.com/oauth2/authorization?response_type=code&client_id=${process.env.POLAR_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.POLAR_REDIRECT_URI || '')}`,
      FITBIT: `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${process.env.FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.FITBIT_REDIRECT_URI || '')}&scope=activity`,
      SUUNTO: `https://cloudapi-oauth.suunto.com/oauth/authorize?response_type=code&client_id=${process.env.SUUNTO_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.SUUNTO_REDIRECT_URI || '')}&scope=workout`
    };

    const authUrl = oauthUrls[provider];

    if (!authUrl) {
      throw new BadRequestError('Proveedor no soportado o configuración incompleta');
    }

    res.json({
      authUrl,
      provider,
    });

  } catch (error) {
    throw error;
  }
});

export default router;
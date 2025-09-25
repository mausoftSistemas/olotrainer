import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import 'express-async-errors';

import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { authMiddleware } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { setupSocketIO } from '@/config/socket';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import workoutRoutes from '@/routes/workouts';
import activityRoutes from '@/routes/activities';
import feedbackRoutes from '@/routes/feedback';
import messageRoutes from '@/routes/messages';
import integrationRoutes from '@/routes/integrations';
import dashboardRoutes from '@/routes/dashboard';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(compression());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply rate limiting to all requests
if (NODE_ENV === 'production') {
  app.use(limiter);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/workouts', authMiddleware, workoutRoutes);
app.use('/api/activities', authMiddleware, activityRoutes);
app.use('/api/feedback', authMiddleware, feedbackRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/integrations', authMiddleware, integrationRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Setup Socket.IO
setupSocketIO(io);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${PORT}`);
      logger.info(`📊 Dashboard: http://localhost:${PORT}/health`);
      logger.info(`🌍 Entorno: ${NODE_ENV}`);
      
      if (NODE_ENV === 'development') {
        logger.info(`🔧 Modo desarrollo activado`);
        logger.info(`📡 CORS habilitado para: ${process.env.CORS_ORIGIN}`);
      }
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };
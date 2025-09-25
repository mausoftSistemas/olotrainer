import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Params: ${e.params}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Log database errors
prisma.$on('error', (e) => {
  logger.error('Database error:', e);
});

// Log database info
prisma.$on('info', (e) => {
  logger.info('Database info:', e.message);
});

// Log database warnings
prisma.$on('warn', (e) => {
  logger.warn('Database warning:', e.message);
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Conexión a la base de datos establecida');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Prueba de conexión exitosa');
    
  } catch (error) {
    logger.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    logger.info('✅ Desconexión de la base de datos exitosa');
  } catch (error) {
    logger.error('❌ Error desconectando de la base de datos:', error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { status: 'unhealthy', message: 'Database connection failed' };
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback);
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

export { prisma };
export default prisma;
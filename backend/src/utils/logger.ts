import winston from 'winston';
import path from 'path';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'olotrainer-backend' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    )
  }));
}

// Create a stream object with a 'write' function that will be used by `morgan`
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Helper functions for different log levels
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | any) => {
  logger.error(message, { error: error?.stack || error });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Request logging helper
export const logRequest = (req: any, res: any, responseTime?: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
    userId: req.user?.id || 'anonymous',
  };
  
  logger.info('HTTP Request', logData);
};

// Database operation logging
export const logDatabaseOperation = (operation: string, table: string, duration?: number) => {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined,
  });
};

// Authentication logging
export const logAuth = (action: string, userId?: string, ip?: string, success: boolean = true) => {
  const level = success ? 'info' : 'warn';
  logger.log(level, `Auth: ${action}`, {
    userId,
    ip,
    success,
    timestamp: new Date().toISOString(),
  });
};

// Integration logging
export const logIntegration = (provider: string, action: string, userId: string, success: boolean = true) => {
  const level = success ? 'info' : 'error';
  logger.log(level, `Integration: ${provider} - ${action}`, {
    provider,
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
  });
};

// Performance logging
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

// Security logging
export const logSecurity = (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') => {
  logger.warn(`Security Event: ${event}`, {
    severity,
    details,
    timestamp: new Date().toISOString(),
  });
};

export { logger };
export default logger;
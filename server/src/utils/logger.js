import winston from 'winston';
import 'winston-daily-rotate-file';

const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

const sanitizeData = (info) => {
  if (info.message && typeof info.message === 'object') {
    const stringified = JSON.stringify(info.message, (key, value) => {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        return '[REDACTED]';
      }
      return value;
    });
    info.message = JSON.parse(stringified);
  }
  return info;
};

const redactFormat = winston.format(sanitizeData);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${stack || (typeof message === 'object' ? JSON.stringify(message) : message)}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  redactFormat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: 'info'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: 'error'
    })
  ]
});

export default logger;
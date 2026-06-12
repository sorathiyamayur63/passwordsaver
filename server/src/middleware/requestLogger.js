import morgan from 'morgan';
import logger from '../utils/logger.js';

morgan.token('request-id', (req) => req.id);

const stream = {
  write: (message) => logger.http(message.trim())
};

const skipHealth = (req) => req.originalUrl === '/api/health';

const requestLogger = morgan(
  ':request-id :method :url :status :res[content-length] - :response-time ms',
  { stream, skip: skipHealth }
);

export default requestLogger;
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error({
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack
  });

  const isProduction = process.env.NODE_ENV === 'production';
  let statusCode = err.statusCode || 500;
  let message = isProduction && statusCode === 500 ? 'Internal server error' : err.message;
  let errors = [];
  let code = err.code || null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => e.message);
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(code && { code }),
    ...(errors.length > 0 && { errors }),
    ...(!isProduction && statusCode === 500 && { stack: err.stack })
  });
};

export default errorHandler;
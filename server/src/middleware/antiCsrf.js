import logger from '../utils/logger.js';

export const antiCsrf = (req, res, next) => {
  // Safe methods skip CSRF check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Ensure JSON content type on mutations to prevent simple form POST attacks
  // const contentType = req.headers['content-type'];
  // if (!contentType || !contentType.includes('application/json')) {
  //   console.error(`[CSRF BLOCK] Invalid Content-Type: ${contentType}`);
  //   return res.status(403).json({ success: false, message: 'Invalid Content-Type. Must be application/json.' });
  // }
  // Ensure JSON content type on mutations that carry a body to prevent simple form POST attacks
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      logger.warn(`[CSRF BLOCK] Invalid Content-Type: ${contentType}`);
      return res.status(403).json({
        success: false,
        message: 'Invalid Content-Type. Must be application/json.'
      });
    }
  }

  // Enforce strict Origin matching if Origin is present
  const origin = req.headers['origin'];
  
  // Safely clean up the URLs from .env (removes accidental spaces or trailing slashes)
  const allowedOrigins = process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
    : ['http://localhost:5173'];

  // For local development, allow both localhost and 127.0.0.1 interchangeably
  if (allowedOrigins.includes('http://localhost:5173')) {
    allowedOrigins.push('http://127.0.0.1:5173');
  }
  
  if (origin && !allowedOrigins.includes(origin)) {
    logger.warn(`[CSRF BLOCK] Origin mismatch! Browser sent: "${origin}", but server only allows: "${allowedOrigins.join(', ')}"`);
    return res.status(403).json({ success: false, message: 'CORS/CSRF policy blocked this request.' });
  }

  next();
};
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Middleware
import { securityConfig } from './src/config/security.js';
import requestId from './src/middleware/requestId.js';
import requestLogger from './src/middleware/requestLogger.js';
import errorHandler from './src/middleware/errorHandler.js';
import { extraSecurityHeaders } from './src/middleware/securityHeaders.js';
import { antiCsrf } from './src/middleware/antiCsrf.js';

// Routers
import authRouter from './src/routes/auth.js';
import vaultRouter from './src/routes/vault.js';
import categoriesRouter from './src/routes/categories.js';
import templatesRouter from './src/routes/templates.js';
import devicesRouter from './src/routes/devices.js';
import accountRouter from './src/routes/account.js';
import backupRouter from './src/routes/backup.js';

const app = express();
app.set('trust proxy', true);
// 1. Strict Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: [
      "'self'",
      "https://passwordsaver-xv0f.onrender.com",
      "https://passwordsaver-peach.vercel.app"
    ],
      frameAncestors: ["'none'"],
      formAction: ["'self'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false,
  hidePoweredBy: true
}));

// Apply custom Headers from Phase 12
app.use(extraSecurityHeaders);

// 2. CORS Configurations
app.use(cors({
  origin: securityConfig.cors.origins,
  credentials: securityConfig.cors.credentials
}));

// 3. Body Parsers & Security Sanitizers
app.use(compression());
app.use(express.json({ limit: '1000kb' }));
app.use(express.urlencoded({ extended: false, limit: '1000kb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// 4. Request Logging & Tracking
app.use(requestId);
app.use(requestLogger);

// 5. Anti-CSRF Middleware (Phase 12 defense in depth)
app.use(antiCsrf);

// 6. API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 7. Mount Core REST API Routers
app.use('/api/auth', authRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/account', accountRouter);
app.use('/api/backup', backupRouter);

// 8. 404 Fallback
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 9. Global Error Handler (Must be the last middleware)
app.use(errorHandler);

export default app;
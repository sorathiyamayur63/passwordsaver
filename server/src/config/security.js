import dotenv from 'dotenv';
dotenv.config();

export const securityConfig = {
  cors: {
    origins: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  },
  rateLimit: {
    auth: { windowMs: 15 * 60 * 1000, max: 10, message: 'Too many attempts, please try again later' },
    api: { windowMs: 15 * 60 * 1000, max: 200 },
    strict: { windowMs: 15 * 60 * 1000, max: 5 }
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: '15m',
    refreshExpiry: '7d'
  },
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  },
  argon2: {
    type: 2, 
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32
  },
  session: {
    idleTimeout: 30 * 60 * 1000,
    absoluteTimeout: 24 * 60 * 60 * 1000
  }
};
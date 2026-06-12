import dotenv from 'dotenv';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

import { connectDB } from './src/config/database.js';
import app from './app.js';
import logger from './src/utils/logger.js';

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const startServer = async () => {
  await connectDB();
  
  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, () => {
    logger.info(`Server running securely on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
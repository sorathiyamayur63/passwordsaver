import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const connectDB = async () => {
  try {




const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      tls: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host} (Encrypted TLS Connection established)`);
  } catch (error) {
    logger.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB runtime error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to application termination');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to application termination');
  process.exit(0);
});
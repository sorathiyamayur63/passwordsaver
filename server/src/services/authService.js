import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export const hashPassword = async (plaintext) => {
  return argon2.hash(plaintext, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32
  });
};

export const verifyPassword = async (hash, plaintext) => {
  try {
    return await argon2.verify(hash, plaintext);
  } catch (error) {
    logger.error('Password verification error', { error: error.message });
    return false;
  }
};

export const generateTokenPair = (userId, userUuid, deviceUuid) => {  const accessToken = jwt.sign(
    { sub: userId.toString(), uuid: userUuid,deviceUuid, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m', issuer: 'passwordsaver', audience: 'passwordsaver-client' }
  );

  const refreshToken = jwt.sign(
    { sub: userId.toString(), uuid: userUuid,deviceUuid, type: 'refresh', jti: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d', issuer: 'passwordsaver', audience: 'passwordsaver-client' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: 'passwordsaver',
    audience: 'passwordsaver-client'
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: 'passwordsaver',
    audience: 'passwordsaver-client'
  });
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
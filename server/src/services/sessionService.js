import { Session } from '../models/index.js';
import { hashToken, generateTokenPair } from './authService.js';
import { hashIp } from './deviceService.js';

export const createSession = async (userId, refreshToken, deviceUuid, req) => {
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return await Session.create({
    userId,
    deviceUuid,
    refreshTokenHash,
    isValid: true,
    expiresAt,
    ipHash: hashIp(req.ip),
    userAgent: req.headers['user-agent'] || 'Unknown'
  });
};

export const validateRefreshToken = async (refreshToken, userId) => {
  const refreshTokenHash = hashToken(refreshToken);

  const session = await Session.findOneAndUpdate(
    {
      userId,
      refreshTokenHash,
      isValid: true,
      expiresAt: { $gt: new Date() }
    },
    {
      $set: { lastUsedAt: new Date() }
    },
    { new: true }
  );

  return session;
};

export const invalidateSession = async (sessionId, userId) => {
  const result = await Session.updateOne(
    { _id: sessionId, userId },
    { $set: { isValid: false } }
  );
  return result.modifiedCount > 0;
};

export const invalidateAllUserSessions = async (userId) => {
  const result = await Session.updateMany(
    { userId, isValid: true },
    { $set: { isValid: false } }
  );
  return result.modifiedCount;
};

export const rotateRefreshToken = async (oldSession, userId, userUuid) => {
  const tokens = generateTokenPair(userId, userUuid);
  const newRefreshTokenHash = hashToken(tokens.refreshToken);

  await Session.updateOne(
    { _id: oldSession._id },
    { 
      $set: { 
        refreshTokenHash: newRefreshTokenHash,
        lastUsedAt: new Date()
      } 
    }
  );

  return tokens;
};
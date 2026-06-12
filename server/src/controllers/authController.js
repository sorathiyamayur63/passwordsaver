import argon2 from 'argon2';
import crypto from 'crypto';
import { User, Category, AuditLog, Device } from '../models/index.js';
import { hashPassword, verifyPassword, generateTokenPair, verifyRefreshToken } from '../services/authService.js';
import { getOrCreateDevice, hashIp, getDeviceFingerprint } from '../services/deviceService.js';
import { createSession, validateRefreshToken, invalidateSession, invalidateAllUserSessions, rotateRefreshToken } from '../services/sessionService.js';
import { securityConfig } from '../config/security.js';

const getClientIp = (req) => {
  let ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress ||
    req.ip;

  if (ip === '::1') {
    ip = '127.0.0.1';
  }

  if (ip?.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  return ip;
};
const setAuthCookies = (res, tokens) => {
  res.cookie('access_token', tokens.accessToken, { 
    ...securityConfig.cookie, 
    maxAge: 15 * 60 * 1000 // 15 mins
  });
  res.cookie('refresh_token', tokens.refreshToken, { 
    ...securityConfig.cookie, 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const clearAuthCookies = (res) => {
  res.cookie('access_token', '', { ...securityConfig.cookie, maxAge: 0 });
  res.cookie('refresh_token', '', { ...securityConfig.cookie, maxAge: 0 });
};

export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Username is already taken' });
    }

    const passwordHash = await hashPassword(password);

    // FIX: Generate a secure random salt for the client's PBKDF2 key derivation
    const vaultKeySalt = crypto.randomBytes(32).toString('base64');


  const user = await User.create({
      username,
      passwordHash,
      vaultKeySalt
    });

    const defaultCategories = Category.getDefaultsForUser(user._id);
    await Category.insertMany(defaultCategories);

    const device = await getOrCreateDevice(user._id, req);
    const tokens = generateTokenPair(user._id, user.uuid, device.uuid);
    await createSession(user._id, tokens.refreshToken, device.uuid, req);

    setAuthCookies(res, tokens);

    await AuditLog.create({
      userId: user._id,
      userUuid: user.uuid,
      action: 'REGISTER',
     // ipHash: hashIp(req.ip),
     ipAddress: getClientIp(req),
ipHash: hashIp(getClientIp(req)),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    // FIX: Ensure the vaultKeySalt is sent back to the frontend so the vault unlocks!
    // const safeUser = user.toSafeObject();
    // safeUser.vaultKeySalt = vaultKeySalt;
    
    // res.status(201).json({
    //   success: true,
    //   message: 'Account created successfully',
    //   data: { user: user.toSafeObject() }
    // });
    const safeUser = user.toSafeObject();

safeUser.vaultKeySalt = vaultKeySalt;

res.status(201).json({
  success: true,
  message: 'Account created successfully',
  data: { user: safeUser }
});
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') }).select('+passwordHash +vaultKeySalt');
    
    if (!user) {
      // Timing attack mitigation: Perform dummy hash to equalize processing time
      await argon2.hash('dummy_timing_mitigation_string');
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.isLocked) {
      return res.status(429).json({ success: false, message: 'Account temporarily locked due to too many failed attempts. Try again later.' });
    }

    const isValidPassword = await verifyPassword(user.passwordHash, password);

    if (!isValidPassword) {
      await user.incLoginAttempts();
      await AuditLog.create({
        userId: user._id,
        userUuid: user.uuid,
        action: 'LOGIN_FAIL',
       // ipHash: hashIp(req.ip),
       ipAddress: getClientIp(req),
ipHash: hashIp(getClientIp(req)),
        userAgent: req.headers['user-agent'],
        requestId: req.id,
        success: false
      });
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    await user.resetLoginAttempts();
    user.lastLoginAt = new Date();
    await user.save();

    const device = await getOrCreateDevice(user._id, req);
    const tokens = generateTokenPair(user._id, user.uuid, device.uuid);
    await createSession(user._id, tokens.refreshToken, device.uuid, req);

    setAuthCookies(res, tokens);

    await AuditLog.create({
      userId: user._id,
      userUuid: user.uuid,
      action: 'LOGIN_SUCCESS',
     // ipHash: hashIp(req.ip),
     ipAddress: getClientIp(req),
ipHash: hashIp(getClientIp(req)),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const safeUser = user.toSafeObject();
    safeUser.vaultKeySalt = user.vaultKeySalt;

    res.status(200).json({
      success: true,
      data: { user: safeUser }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const session = await validateRefreshToken(refreshToken, decoded.sub);
        if (session) {
          await invalidateSession(session._id, decoded.sub);
        }
      } catch (err) {
        // Ignore token errors on logout, just proceed to clear cookies
      }
    }

    clearAuthCookies(res);

    if (req.userId) {
      await AuditLog.create({
        userId: req.userId,
        userUuid: req.userUuid,
        action: 'LOGOUT',
       // ipHash: hashIp(req.ip),
       ipAddress: getClientIp(req),
ipHash: hashIp(getClientIp(req)),
        userAgent: req.headers['user-agent'],
        requestId: req.id
      });
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const currentRefreshToken = req.cookies?.refresh_token;

    if (!currentRefreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(currentRefreshToken);
    } catch (err) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const session = await validateRefreshToken(currentRefreshToken, decoded.sub);
    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Session expired or invalidated' });
    }

    const tokens = await rotateRefreshToken(session, decoded.sub, decoded.uuid);
    setAuthCookies(res, tokens);

    res.status(200).json({ success: true, message: 'Token refreshed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user.toSafeObject() }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    const user = await User.findById(req.userId).select('+passwordHash');

    const isValidPassword = await verifyPassword(user.passwordHash, currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.passwordHash = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    await invalidateAllUserSessions(user._id);
    
    // Create new session for current device to keep them logged in
    const device = await getOrCreateDevice(user._id, req);
    const tokens = generateTokenPair(user._id, user.uuid, device.uuid);
    await createSession(user._id, tokens.refreshToken, device.uuid, req);
    setAuthCookies(res, tokens);

    await AuditLog.create({
      userId: user._id,
      userUuid: user.uuid,
      action: 'PASSWORD_CHANGE',
     // ipHash: hashIp(req.ip),
     ipAddress: getClientIp(req),
ipHash: hashIp(getClientIp(req)),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Password changed successfully. All other sessions have been logged out.' });
  } catch (error) {
    next(error);
  }
};

export const logoutAllDevices = async (req, res, next) => {
  try {
    await invalidateAllUserSessions(req.userId);

await Device.updateMany(
  {
    userId: req.userId,
    deviceFingerprint: {
      $ne: getDeviceFingerprint(req)
    }
  },
  {
    $set: {
      isRevoked: true,
      revokedAt: new Date()
    }
  }
);

    clearAuthCookies(res);

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'SESSION_REVOKE',
      details: { scope: 'all' },
      //ipHash: hashIp(req.ip),
      ipAddress: getClientIp(req),
ipHash: hashIp(getClientIp(req)),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
};
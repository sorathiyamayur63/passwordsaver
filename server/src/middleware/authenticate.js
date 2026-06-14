import { verifyAccessToken } from '../services/authService.js';
import { User, Session } from '../models/index.js';
import logger from '../utils/logger.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = verifyAccessToken(token);

    if (decoded.type !== 'access') {
      return res.status(401).json({
        success:false,
        message:'Invalid token type'
      });
    }

    const user = await User.findById(decoded.sub)
      .select('-passwordHash');


    if (!user || !user.isActive) {
      return res.status(401).json({
        success:false,
        message:'User account disabled or deleted'
      });
    }


    // Device/session validation
    const session = await Session.findOne({
      userId: user._id,
      deviceUuid: decoded.deviceUuid,
      isValid: true
    });


    if (!session) {
      return res.status(401).json({
        success:false,
        message:'Session revoked',
        code:'SESSION_REVOKED'
      });
    }


    // Password change invalidates old tokens
    if (user.passwordChangedAt && decoded.iat) {

      const changedTimestamp =
        parseInt(user.passwordChangedAt.getTime() / 1000, 10);

      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success:false,
          message:'Session expired due to password change'
        });
      }
    }


    req.user = user;
    req.userId = user._id;
    req.userUuid = user.uuid;

    next();

  } catch (error) {

    logger.warn('Auth token verification failed', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success:false,
        message:'Access token expired',
        code:'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success:false,
      message:'Invalid authentication token',
      code:'INVALID_TOKEN'
    });
  }
};
import express from 'express';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import { validateRegister, validateLogin } from '../middleware/validate.js';
import { requireAuth } from '../middleware/authenticate.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', strictLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', requireAuth, authController.getMe);
router.put('/change-password', requireAuth, authController.changePassword);
router.post('/logout-all', requireAuth, authController.logoutAllDevices);

export default router;
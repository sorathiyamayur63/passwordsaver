import express from 'express';
import { requireAuth } from '../middleware/authenticate.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { getNotifications } from '../controllers/notificationController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', apiLimiter, getNotifications);

export default router;

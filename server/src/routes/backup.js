import express from 'express';
import { requireAuth } from '../middleware/authenticate.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import * as backupController from '../controllers/backupController.js';

const router = express.Router();
router.use(requireAuth);

router.get('/export', strictLimiter, backupController.createServerBackup);
router.post('/import', strictLimiter, backupController.restoreFromBackup);

export default router;
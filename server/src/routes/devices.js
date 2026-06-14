import express from 'express';
import { requireAuth } from '../middleware/authenticate.js';
import { verifyOwnership } from '../middleware/verifyOwnership.js';
import { apiLimiter, vaultLimiter } from '../middleware/rateLimiter.js';
import { Device } from '../models/index.js';
import * as deviceController from '../controllers/deviceController.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', apiLimiter, deviceController.getDevices);
router.get('/login-history', apiLimiter, deviceController.getLoginHistory);
router.delete('/:uuid', vaultLimiter, verifyOwnership(Device), deviceController.revokeDevice);
router.delete('/history/:uuid', vaultLimiter, verifyOwnership(Device), deviceController.deleteDevice);
export default router;
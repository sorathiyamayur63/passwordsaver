import express from 'express';
import { requireAuth } from '../middleware/authenticate.js';
import { verifyOwnership } from '../middleware/verifyOwnership.js';
import { Device } from '../models/index.js';
import * as deviceController from '../controllers/deviceController.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', deviceController.getDevices);
router.get('/login-history', deviceController.getLoginHistory);
router.delete('/:uuid', verifyOwnership(Device), deviceController.revokeDevice);
router.delete('/history/:uuid', verifyOwnership(Device), deviceController.deleteDevice);
export default router;
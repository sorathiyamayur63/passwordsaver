import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { requireAuth } from '../middleware/authenticate.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import * as accountController from '../controllers/accountController.js';

const router = express.Router();

const validateUsername = [
  body('newUsername').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('3-30 chars, alphanumeric/underscore only'),
  body('currentPassword').notEmpty(),
  handleValidationErrors
];

router.use(requireAuth);
router.get('/profile', accountController.getUserProfile);
router.put('/username', validateUsername, accountController.updateUsername);
router.get('/export', strictLimiter, accountController.exportUserData);
router.delete('/', strictLimiter, accountController.deleteAccount);

export default router;
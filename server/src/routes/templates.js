import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { requireAuth } from '../middleware/authenticate.js';
import { verifyOwnership } from '../middleware/verifyOwnership.js';
import { apiLimiter, vaultLimiter } from '../middleware/rateLimiter.js';
import { Template } from '../models/index.js';
import * as templateController from '../controllers/templateController.js';

const router = express.Router();

const validateTemplateFields = [
  body('name').trim().notEmpty().withMessage('Template name is required').isLength({ max: 100 }),
  body('description').optional().isString(),
  body('fields').isArray({ min: 1 }).withMessage('At least one field is required'),
  body('fields.*.label').notEmpty().withMessage('Field label is required'),
  body('fields.*.fieldType').isIn(['text', 'password', 'number', 'date', 'email', 'url', 'phone', 'checkbox', 'dropdown', 'textarea']),
  handleValidationErrors
];

router.use(requireAuth);

router.get('/', apiLimiter, templateController.getTemplates);
router.post('/', vaultLimiter, validateTemplateFields, templateController.createTemplate);
router.put('/:uuid', vaultLimiter, verifyOwnership(Template), validateTemplateFields, templateController.updateTemplate);
router.delete('/:uuid', vaultLimiter, verifyOwnership(Template), templateController.deleteTemplate);

export default router;
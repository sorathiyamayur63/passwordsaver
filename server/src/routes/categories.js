import express from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate.js';
import { requireAuth } from '../middleware/authenticate.js';
import { verifyOwnership } from '../middleware/verifyOwnership.js';
import { apiLimiter, vaultLimiter } from '../middleware/rateLimiter.js';
import { Category } from '../models/index.js';
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from '../controllers/categoryController.js';

const router = express.Router();

// Validations
const validateCategoryBody = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Max length is 50 chars'),
  body('icon').optional().isString(),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Must be a valid hex color'),
  handleValidationErrors
];

router.use(requireAuth);

router.get('/', apiLimiter, getCategories);
router.post('/', vaultLimiter, validateCategoryBody, createCategory);
router.put('/reorder', reorderCategories);
router.put('/:uuid', vaultLimiter, verifyOwnership(Category), validateCategoryBody, updateCategory);
router.delete('/:uuid', vaultLimiter, verifyOwnership(Category), deleteCategory);

export default router;
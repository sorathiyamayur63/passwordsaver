import { body } from 'express-validator';
import { handleValidationErrors } from './validate.js';

export const validateCreateVaultItem = [
  body('encryptedData').isString().notEmpty().withMessage('Encrypted data is required'),
  body('iv').isString().notEmpty().isBase64().withMessage('IV must be a valid base64 string'),
  body('authTag').isString().notEmpty().isBase64().withMessage('Auth tag must be a valid base64 string'),
  body('itemType').isIn([
    'login', 'credit_card', 'debit_card', 'bank_account', 
    'aadhaar', 'passport', 'personal_info', 'api_key', 
    'software_license', 'secure_note', 'custom'
  ]).withMessage('Invalid item type'),
  body('encryptedTitle').optional({ checkFalsy: true }).isString(),
  body('titleIv').optional({ checkFalsy: true }).isString(),
  body('titleAuthTag').optional({ checkFalsy: true }).isString(),
  body('categoryUuid').optional({ checkFalsy: true }).isUUID(4).withMessage('Category must be a valid UUID'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
    .custom(arr => arr.every(t => typeof t === 'string' && t.length <= 50))
    .withMessage('Each tag must be a string up to 50 characters'),
  handleValidationErrors
];

export const validateUpdateVaultItem = [
  body('encryptedData').optional().isString(),
  body('iv').optional().isBase64(),
  body('authTag').optional().isBase64(),
  body('isFavorite').optional().isBoolean(),
  body('isArchived').optional().isBoolean(),
  body('categoryUuid').optional({ checkFalsy: true }).isUUID(4),
  body('tags').optional().isArray()
    .custom(arr => arr.every(t => typeof t === 'string' && t.length <= 50)),
  handleValidationErrors
];
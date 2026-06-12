import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters containing only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((val) => {
      if (!/[A-Z]/.test(val)) throw new Error('Password must contain at least one uppercase letter');
      if (!/[a-z]/.test(val)) throw new Error('Password must contain at least one lowercase letter');
      if (!/[0-9]/.test(val)) throw new Error('Password must contain at least one number');
      return true;
    }),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  handleValidationErrors
];

export const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];
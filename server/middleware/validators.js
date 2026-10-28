const { body, validationResult } = require('express-validator');

/**
 * Middleware to extract and format validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for user registration
 * POST /api/auth/register
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid university email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('major')
    .optional()
    .trim(),
  handleValidationErrors,
];

/**
 * Validation rules for user login
 * POST /api/auth/login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid university email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Validation rules for creating/adding skills
 * POST /api/skills
 */
const validateCreateSkill = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Skill type is required')
    .isIn(['teach', 'learn'])
    .withMessage("Skill type must be either 'teach' or 'learn'"),
  body('level')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim(),
  handleValidationErrors,
];

/**
 * Validation rules for updating skills
 * PATCH /api/skills/:id
 */
const validateUpdateSkill = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Skill name must be between 2 and 100 characters'),
  body('level')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim(),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateSkill,
  validateUpdateSkill,
  handleValidationErrors,
};

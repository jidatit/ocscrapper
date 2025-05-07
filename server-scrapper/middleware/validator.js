const { body, param, validationResult } = require('express-validator');

// Validate case creation
const validateCaseInfo = [
  body('caseNumber').notEmpty().withMessage('Case number is required').trim(),
  body('plaintiffs').isArray().withMessage('Plaintiffs must be an array'),
  body('defendants').isArray().withMessage('Defendants must be an array'),
  body('judgmentDetails')
    .isArray()
    .withMessage('Judgment details must be an array'),
  body('judgmentDetails.*.name')
    .optional()
    .isString()
    .withMessage('Judgment name must be a string'),
  body('judgmentDetails.*.date')
    .optional()
    .isString()
    .withMessage('Judgment date must be a string'),
  body('caseType').optional().isString().withMessage('Case type must be a string'),
  body('dateFiled')
    .optional()
    .isString()
    .withMessage('Date filed must be a string'),
  body('pdfUrl').optional().isURL().withMessage('PDF URL must be a valid URL'),
];

// Validate case number parameter
const validateCaseNumber = [
  param('caseNumber').notEmpty().withMessage('Case number is required').trim(),
];

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateCaseInfo,
  validateCaseNumber,
  validate,
};
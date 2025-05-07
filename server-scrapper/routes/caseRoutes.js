const express = require("express");
const router = express.Router();
const caseController = require("../controllers/caseController");
const {
  validateCaseInfo,
  validateCaseNumber,
  validate,
} = require("../middleware/validator");
const { requireAuth } = require("../middleware/authMiddleware");
router.use(requireAuth);
/**
 * @route   POST /api/store-detailed-case-info
 * @desc    Store detailed case information
 * @access  Public
 */
router.post(
  "/store-detailed-case-info",
  validateCaseInfo,
  // validate,
  caseController.storeDetailedCaseInfo
);

/**
 * @route   GET /api/case/:caseNumber
 * @desc    Get case details by case number
 * @access  Public
 */
router.get(
  "/case/:caseNumber",
  validateCaseNumber,
  validate,
  caseController.getCaseDetails
);

/**
 * @route   GET /api/cases
 * @desc    Get all cases
 * @access  Public
 */
router.get("/cases", caseController.getAllCases);

/**
 * @route   GET /api/cases
 * @desc    Get all cases
 * @access  Public
 */
router.get("/cases/export", caseController.exportCasesCsv);

/**
 * @route   DELETE /api/case/:caseNumber
 * @desc    Delete case by case number
 * @access  Public
 */
router.delete(
  "/case/:caseNumber",
  validateCaseNumber,
  validate,
  caseController.deleteCase
);

module.exports = router;

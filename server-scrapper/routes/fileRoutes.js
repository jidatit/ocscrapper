const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const upload = require("../middleware/fileUpload");
const { requireAuth } = require("../middleware/authMiddleware");
router.use(requireAuth);
/**
 * @route   POST /api/store-pdf
 * @desc    Store a PDF file and create basic case entry
 * @access  Public
 */
router.post("/store-pdf", upload.single("pdfFile"), fileController.storePdf);

module.exports = router;

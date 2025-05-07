const fileService = require("../services/fileService");
const caseService = require("../services/caseService");
const logger = require("../utils/logger");
const { extractAddresses } = require("../services/addressService");

/**
 * Store a PDF file and create basic case entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const storePdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { caseNumber } = req.body;

    if (!caseNumber) {
      return res.status(400).json({ error: "Case number is required" });
    }

    // Upload file to S3
    const pdfUrl = await fileService.uploadFileToS3(
      req.file.buffer,
      req.file.originalname,
      caseNumber
    );

    // Create or update case with basic info
    const caseData = await caseService.createCase({
      caseNumber,
      pdfUrl,
    });

    res.status(201).json({
      success: true,
      data: {
        caseNumber: caseData.caseNumber,
        pdfUrl: caseData.pdfUrl,
      },
    });

    // 2) Kick off address‐extraction in the “background”
    extractAddresses(caseData.caseNumber, caseData.pdfUrl).catch((err) =>
      console.error("Address extraction failed:", err)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  storePdf,
};

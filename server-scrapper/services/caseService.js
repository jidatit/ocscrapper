const Case = require("../models/Case");
const logger = require("../utils/logger");
const fileService = require("./fileService");

/**
 * Create a new case with basic information and PDF URL
 * @param {Object} caseData - Basic case data
 * @returns {Promise<Object>} - The created case
 */
const createCase = async (caseData) => {
  try {
    const existingCase = await Case.findOne({
      caseNumber: caseData.caseNumber,
    });

    if (existingCase) {
      // Update existing case with new information
      Object.assign(existingCase, caseData);
      await existingCase.save();
      logger.info(`Case ${caseData.caseNumber} updated`);
      return existingCase;
    } else {
      // Create new case
      const newCase = await Case.create(caseData);
      logger.info(`Case ${caseData.caseNumber} created`);
      return newCase;
    }
  } catch (error) {
    logger.error(`Error creating/updating case: ${error.message}`);
    throw error;
  }
};

/**
 * Update a case with detailed information
 * @param {String} caseNumber - The case number
 * @param {Object} caseDetails - Detailed case information
 * @returns {Promise<Object>} - The updated case
 */
const updateCaseDetails = async (caseNumber, caseDetails) => {
  try {
    // Try to find an existing case
    let caseDoc = await Case.findOne({ caseNumber });

    if (!caseDoc) {
      // Create new if not found
      caseDoc = new Case({ caseNumber, ...caseDetails });
      await caseDoc.save();
      logger.info(`Case ${caseNumber} created with details.`);
    } else {
      // Otherwise merge and save
      Object.assign(caseDoc, caseDetails);
      await caseDoc.save();
      logger.info(`Case ${caseNumber} details updated.`);
    }

    return caseDoc;
  } catch (error) {
    logger.error(
      `Error creating/updating case ${caseNumber}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Get a case by case number
 * @param {String} caseNumber - The case number
 * @returns {Promise<Object>} - The case
 */
const getCaseByCaseNumber = async (caseNumber) => {
  try {
    const caseData = await Case.findOne({ caseNumber });

    if (!caseData) {
      throw new Error(`Case not found with case number: ${caseNumber}`);
    }

    return caseData;
  } catch (error) {
    logger.error(`Error getting case by case number: ${error.message}`);
    throw error;
  }
};

/**
 * Fetch paginated & searchable cases, with date ranges
 * expanded to whole days.
 */
async function getAllCases({
  page = 1,
  limit = 10,
  search = "",
  startFiled,
  endFiled,
  startUpdated,
  endUpdated,
}) {
  const query = {};

  // —— text search
  if (search.trim()) {
    const re = new RegExp(search.trim(), "i");
    query.$or = [
      { caseNumber: re },
      { caseType: re },
      { "plaintiffs.name": re },
      { "defendants.name": re },
    ];
  }

  // —— dateFiled range: expand to full days
  if (startFiled || endFiled) {
    const df = {};
    if (startFiled) {
      const start = new Date(startFiled);
      start.setHours(0, 0, 0, 0);
      df.$gte = start;
    }
    if (endFiled) {
      const end = new Date(endFiled);
      end.setHours(23, 59, 59, 999);
      df.$lte = end;
    }
    query.dateFiled = df;
  }

  // —— updatedAt range: expand to full days
  if (startUpdated || endUpdated) {
    const du = {};
    if (startUpdated) {
      const start = new Date(startUpdated);
      start.setHours(0, 0, 0, 0);
      du.$gte = start;
    }
    if (endUpdated) {
      const end = new Date(endUpdated);
      end.setHours(23, 59, 59, 999);
      du.$lte = end;
    }
    query.updatedAt = du;
  }

  // count + fetch
  const total = await Case.countDocuments(query);
  const cases = await Case.find(query)
    .select("caseNumber pdfUrl caseType dateFiled updatedAt")
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { cases, total };
}
/**
 * Delete a case by case number, including the associated PDF file if requested
 * @param {String} caseNumber - The case number
 * @param {Boolean} deleteFile - Whether to delete the associated file
 * @returns {Promise<Boolean>} - Whether the deletion was successful
 */
const deleteCaseByCaseNumber = async (caseNumber, deleteFile = false) => {
  try {
    const caseData = await Case.findOne({ caseNumber });

    if (!caseData) {
      throw new Error(`Case not found with case number: ${caseNumber}`);
    }

    // Delete the file from S3 if requested
    if (deleteFile && caseData.pdfUrl) {
      await fileService.deleteFileFromS3(caseData.pdfUrl);
    }

    // Delete the case from MongoDB
    await Case.deleteOne({ caseNumber });

    logger.info(`Case ${caseNumber} deleted`);
    return true;
  } catch (error) {
    logger.error(`Error deleting case: ${error.message}`);
    throw error;
  }
};
/**
 * Stream *all* cases (no skip/limit), optionally filtered
 * by updatedAt range. Uses .lean() so that the cursor
 * emits plain JavaScript objects.
 */
async function streamCasesByUpdatedRange({ startUpdated, endUpdated }) {
  const query = {};

  if (startUpdated || endUpdated) {
    query.updatedAt = {};
    if (startUpdated) query.updatedAt.$gte = new Date(startUpdated);
    if (endUpdated) query.updatedAt.$lte = new Date(endUpdated);
  }

  return Case.find(query)
    .sort({ updatedAt: -1 })
    .lean() // <-- return plain objects
    .cursor(); // <-- streaming cursor
}
module.exports = {
  createCase,
  updateCaseDetails,
  getCaseByCaseNumber,
  getAllCases,
  deleteCaseByCaseNumber,
  streamCasesByUpdatedRange,
};

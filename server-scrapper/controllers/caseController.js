const caseService = require("../services/caseService");
const logger = require("../utils/logger");

/**
 * Store detailed case information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const storeDetailedCaseInfo = async (req, res, next) => {
  try {
    const { caseNumber } = req.body;

    // Update case with detailed information
    const updatedCase = await caseService.updateCaseDetails(
      caseNumber,
      req.body
    );

    res.status(200).json({
      success: true,
      data: updatedCase,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get case details by case number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCaseDetails = async (req, res, next) => {
  try {
    const { caseNumber } = req.params;

    // Get case by case number
    const caseData = await caseService.getCaseByCaseNumber(caseNumber);

    res.status(200).json({
      success: true,
      data: caseData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all cases
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllCases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const startFiled = req.query.startFiled; // "YYYY-MM-DD"
    const endFiled = req.query.endFiled;
    const startUpdated = req.query.startUpdated;
    const endUpdated = req.query.endUpdated;

    const { cases, total } = await caseService.getAllCases({
      page,
      limit,
      search,
      startFiled,
      endFiled,
      startUpdated,
      endUpdated,
    });

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: cases.length,
      data: cases,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete case by case number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteCase = async (req, res, next) => {
  try {
    const { caseNumber } = req.params;
    const { deleteFile } = req.query;

    // Delete case
    await caseService.deleteCaseByCaseNumber(caseNumber, deleteFile === "true");

    res.status(200).json({
      success: true,
      message: `Case ${caseNumber} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * Stream cases as CSV within a given updated range.
 */
const exportCasesCsv = async (req, res, next) => {
  try {
    const { startUpdated, endUpdated } = req.query;

    // Build filename…
    let filename;
    if (startUpdated && endUpdated) {
      filename = `cases_${startUpdated}_to_${endUpdated}.csv`;
    } else if (startUpdated) {
      filename = `cases_from_${startUpdated}.csv`;
    } else if (endUpdated) {
      filename = `cases_to_${endUpdated}.csv`;
    } else {
      filename = `cases_all.csv`;
    }

    // Set headers for CSV
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Define our columns, now including Plaintiff Addresses
    const columns = [
      "Case Number",
      "Case Type",
      "Date Filed",
      "Plaintiff Names",
      "Plaintiff Addresses",
      "Defendant Names",
      "Defendant Addresses",
      "Judgments",
      "Created At",
      "Updated At",
      "PDF URL",
    ];
    res.write(columns.join(",") + "\n");

    const cursor = await caseService.streamCasesByUpdatedRange({
      startUpdated,
      endUpdated,
    });

    cursor.on("data", (doc) => {
      const fmtDate = (d) => {
        if (!d) return "";
        const date = d instanceof Date ? d : new Date(d);
        if (isNaN(date)) return "";
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      };

      // Safely extract names and addresses
      const listToDelimited = (items = [], key) => {
        return items
          .map((item) => {
            const value = item && item[key] ? item[key].toString() : "";
            return value.replace(/\n/g, " ").trim();
          })
          .filter((v) => v)
          .join("; ");
      };

      const plaintiffNames = listToDelimited(doc.plaintiffs, "name");
      const plaintiffAddresses = listToDelimited(doc.plaintiffs, "address");
      const defendantNames = listToDelimited(doc.defendants, "name");
      const defendantAddresses = listToDelimited(doc.defendants, "address");

      // Judgments
      const judgments = (doc.judgmentDetails || [])
        .map((j) => {
          const dateStr = fmtDate(j.date);
          const nameStr = j.name ? j.name.replace(/\s+/g, " ").trim() : "";
          return [dateStr, nameStr].filter((x) => x).join(": ");
        })
        .filter((v) => v)
        .join("; ");

      const rowValues = [
        doc.caseNumber || "",
        doc.caseType || "",
        fmtDate(doc.dateFiled),
        plaintiffNames,
        plaintiffAddresses,
        defendantNames,
        defendantAddresses,
        judgments,
        fmtDate(doc.createdAt),
        fmtDate(doc.updatedAt),
        doc.pdfUrl || "",
      ];

      const row = rowValues.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");

      res.write(row + "\n");
    });

    cursor.on("end", () => res.end());
    cursor.on("error", (err) => next(err));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  storeDetailedCaseInfo,
  getCaseDetails,
  getAllCases,
  deleteCase,
  exportCasesCsv,
};

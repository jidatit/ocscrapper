// services/addressService.js
const Case = require("../models/Case");
const ImageProcessingService = require("./ImageProcessingService");

const imgService = new ImageProcessingService();

/**
 * extractAddresses
 *
 * Downloads the document, calls Gemini to get back
 * { plaintiff_address, defendant_address }, injects them
 * into the case, and updates status flags.
 *
 * @param {string} caseNumber
 * @param {string} pdfUrl
 */
async function extractAddresses(caseNumber, pdfUrl) {
  // Load the case first
  const caseDoc = await Case.findOne({ caseNumber });
  if (!caseDoc) throw new Error(`Case ${caseNumber} not found`);

  try {
    // 2) Call Gemini
    const { plaintiff_address, defendant_address } =
      await imgService.extractPartiesAddresses(pdfUrl);

    // 3) Inject addresses into first plaintiff/defendant
    if (caseDoc.plaintiffs.length) {
      caseDoc.plaintiffs[0].address = plaintiff_address;
      caseDoc.markModified("plaintiffs");
    }
    if (caseDoc.defendants.length) {
      caseDoc.defendants[0].address = defendant_address;
      caseDoc.markModified("defendants");
    }

    // 4) Set flag and clear error
    caseDoc.addressesArrived = true;
    caseDoc.addressError = null;
  } catch (err) {
    // On any error, record it and leave addressesArrived=false
    caseDoc.addressesArrived = false;
    caseDoc.addressError = err.message;
  }

  // 5) Save the document
  await caseDoc.save();
}

module.exports = { extractAddresses };

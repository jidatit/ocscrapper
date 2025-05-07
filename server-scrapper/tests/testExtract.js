const ImageProcessingService = require("../services/ImageProcessingService");

// testExtract.js
require("dotenv").config();

(async function testExtraction() {
  const service = new ImageProcessingService();

  // Sample TIFF URL for testing
  const sampleUrl =
    "https://scrapper101.s3.eu-north-1.amazonaws.com/cases/2010-SC-000173-O/2010_SC_000173_O_1746511466839.tiff";

  console.log(`Testing address extraction on:\n  ${sampleUrl}\n`);

  try {
    const result = await service.extractPartiesAddresses(sampleUrl);
    console.log("result in test", result);
    console.log("✅ Extraction succeeded:");
    console.log("  Plaintiff address:", result.plaintiff_address);
    console.log("  Defendant address:", result.defendant_address);
  } catch (err) {
    console.error("❌ Extraction failed:", err.message);
  }
})();

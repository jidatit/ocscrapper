/* === jobs/retryAddresses.js === */
const cron = require("node-cron");
const logger = require("../utils/logger");
const { extractAddresses } = require("../services/addressService");
const Case = require("../models/Case");

/**
 * Schedule a cron job that retries address extraction for any cases
 * where addressesArrived is still false.
 * Fetches only needed fields and processes in batches via cursor.
 */
function scheduleAddressRetry() {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    logger.info("[Cron] Running scheduled address-extraction retry...");
    try {
      // Create a cursor to stream only the caseNumber & pdfUrl fields
      const cursor = Case.find({
        addressesArrived: false,
        pdfUrl: { $exists: true, $ne: null },
      })
        .select("caseNumber pdfUrl")
        .lean()
        .cursor();

      let count = 0;
      for (
        let doc = await cursor.next();
        doc != null;
        doc = await cursor.next()
      ) {
        count++;
        extractAddresses(doc.caseNumber, doc.pdfUrl)
          .then(() =>
            logger.info(`[Cron] Successfully retried ${doc.caseNumber}`)
          )
          .catch((err) =>
            logger.error(
              `[Cron] Retry failed for ${doc.caseNumber}: ${err.message}`
            )
          );
      }

      logger.info(`[Cron] Dispatched ${count} pending cases for retry`);
    } catch (err) {
      logger.error(`[Cron] Error fetching pending cases: ${err.message}`);
    }
  });
}

module.exports = { scheduleAddressRetry };

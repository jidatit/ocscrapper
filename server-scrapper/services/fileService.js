const s3 = require("../config/s3");
const logger = require("../utils/logger");
const path = require("path");

/**
 * Upload a file to S3 before uploading , delete exsisting files , this is to handle if the same caseNumber comes again.
 * @param {Buffer} fileBuffer - The file buffer
 * @param {String} fileName - The name of the file
 * @param {String} caseNumber - The case number to use in the file path
 * @returns {Promise<String>} - The URL of the uploaded file
 */

const uploadFileToS3 = async (fileBuffer, fileName, caseNumber) => {
  try {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    // cases/ folder at root, then one subfolder per caseNumber
    const prefix = `cases/${caseNumber}/`;

    // 1. List existing objects under this caseNumber subfolder
    const listed = await s3
      .listObjectsV2({ Bucket: bucket, Prefix: prefix })
      .promise();

    if (listed.Contents.length > 0) {
      // 2. Delete all files in that subfolder
      const deleteParams = {
        Bucket: bucket,
        Delete: {
          Objects: listed.Contents.map(({ Key }) => ({ Key })),
        },
      };
      await s3.deleteObjects(deleteParams).promise();
      logger.info(`Cleared existing files in ${prefix}`);
    }

    // 3. Sanitize and timestamp the new filename
    const ext = path.extname(fileName).toLowerCase();
    const safeFileName = `${caseNumber.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${Date.now()}${ext}`;

    // 4. Upload the new file into cases/{caseNumber}/
    const params = {
      Bucket: bucket,
      Key: `${prefix}${safeFileName}`,
      Body: fileBuffer,
      ContentType: ext === ".pdf" ? "application/pdf" : "image/tiff",
      ACL: "private",
    };

    const result = await s3.upload(params).promise();
    logger.info(`File uploaded successfully to ${result.Location}`);
    return result.Location;
  } catch (error) {
    logger.error(`Error uploading file to S3: ${error.message}`);
    throw new Error(`File upload failed: ${error.message}`);
  }
};
/**
 * Delete a file from S3
 * @param {String} fileUrl - The URL of the file to delete
 * @returns {Promise<Boolean>} - Whether the deletion was successful
 */
const deleteFileFromS3 = async (fileUrl) => {
  try {
    // Extract the key from the URL
    const urlParts = new URL(fileUrl);
    const key = urlParts.pathname.substring(1); // Remove leading slash

    // Set up S3 delete parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    // Delete from S3
    await s3.deleteObject(params).promise();
    logger.info(`File deleted successfully from S3: ${key}`);

    return true;
  } catch (error) {
    logger.error(`Error deleting file from S3: ${error.message}`);
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

module.exports = {
  uploadFileToS3,
  deleteFileFromS3,
};

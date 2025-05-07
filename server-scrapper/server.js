const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

// Load environment variables
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT, () => {
  logger.info(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection:", err);
  // Close server & exit process
  process.exit(1);
});

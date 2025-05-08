const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { errorHandler } = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const caseRoutes = require("./routes/caseRoutes");
const fileRoutes = require("./routes/fileRoutes");
const authRoutes = require("./routes/authRoutes");
const logger = require("./utils/logger");
const { scheduleAddressRetry } = require("./jobs/retryAddresses");

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Set security headers
app.use(
  cors({
    origin: true,
    credentials: true,
  })
); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api", authRoutes);
app.use("/api", caseRoutes);
app.use("/api", fileRoutes);

// Kick off the cron job when the app starts
scheduleAddressRetry();

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
app.use(errorHandler);

module.exports = app;

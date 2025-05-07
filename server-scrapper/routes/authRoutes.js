const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

// @route   POST /api/auth/signup
router.post("/auth/signup", authController.signup);

// @route   POST /api/auth/login
router.post("/auth/login", authController.login);

// @route   POST /api/auth/logout
router.post("/auth/logout", authController.logout);
router.get("/auth/me", requireAuth, authController.getMe);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change current user’s password
 * @access  Private
 */
router.post(
  "/auth/change-password",
  requireAuth,
  authController.changePassword
);
module.exports = router;

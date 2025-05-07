const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const JWT_SECRET = process.env.JWT_SECRET || "replace-me";

async function registerUser({ email, password }) {
  // check if exists
  if (await User.findOne({ email })) {
    const err = new Error("Email already in use");
    err.status = 400;
    throw err;
  }
  const user = new User({ email, password });
  await user.save();
  logger.info(`New user created: ${user._id}`);
  return signToken(user.id);
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }
  logger.info(`User logged in: ${user._id}`);
  return signToken(user.id);
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "1d" });
}

/**
 * Change a user’s password after verifying the old one.
 * @param {Object} opts
 * @param {string} opts.userId
 * @param {string} opts.oldPassword
 * @param {string} opts.newPassword
 */
async function changeUserPassword({ userId, oldPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  // verify old password
  const matches = await user.comparePassword(oldPassword);
  if (!matches) {
    const err = new Error("Old password is incorrect");
    err.status = 401;
    throw err;
  }

  // set & hash new password
  user.password = newPassword;
  await user.save();
  logger.info(`User ${userId} changed their password`);
}

module.exports = { registerUser, loginUser, changeUserPassword };

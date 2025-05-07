const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "replace-me";

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error("No token");
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).select("-password");
    if (!user) throw new Error("User not found");
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { requireAuth };

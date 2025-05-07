const authService = require("../services/authService");

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await authService.registerUser({ email, password });
    // send JWT as httpOnly cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      })
      .status(201)
      .json({ success: true });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await authService.loginUser({ email, password });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
      })
      .status(200)
      .json({ success: true });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res
    .clearCookie("token", { httpOnly: true, sameSite: "lax" })
    .status(200)
    .json({ success: true });
};
const getMe = (req, res) => {
  // requireAuth already attached `req.user`
  res.status(200).json({ success: true, user: req.user });
};
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    await authService.changeUserPassword({
      userId,
      oldPassword,
      newPassword,
    });

    res.status(200).json({ success: true, message: "Password changed" });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, getMe, changePassword };

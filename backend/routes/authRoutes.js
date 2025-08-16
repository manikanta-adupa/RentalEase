const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword, verifyEmail } = require("../controllers/AuthController");
const { validateRegistration, validateLogin } = require("../middleware/validation");
const { authLimiter, apiLimiter, strictLimiter } = require("../middleware/rateLimiter");
const { auth } = require("../middleware/auth");

router.post("/register", authLimiter, validateRegistration, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/verify-email", authLimiter, verifyEmail);

// router.get("/profile", auth);

module.exports = router;
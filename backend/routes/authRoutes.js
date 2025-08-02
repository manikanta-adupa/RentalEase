const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/AuthController");
const { validateRegistration, validateLogin } = require("../middleware/validation");
const { authLimiter, apiLimiter, strictLimiter } = require("../middleware/rateLimiter");
const { auth } = require("../middleware/auth");

router.post("/register",authLimiter, validateRegistration, register);
router.post("/login", authLimiter, validateLogin, login);

// router.get("/profile", auth);

module.exports = router;
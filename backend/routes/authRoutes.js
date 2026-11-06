const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refresh,
  me,
} = require("../controllers/authController");
const requireAuth = require("../middlewares/auth");

const loginLimiter = require("../middlewares/rateLimiter");

router.post("/register", register);

router.get("/me", requireAuth, me);

router.post("/login", loginLimiter, login);

router.post("/logout", logout);

router.post("/refresh", refresh);

module.exports = router;

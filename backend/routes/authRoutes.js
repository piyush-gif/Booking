const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  refresh,
} = require("../controllers/authController");

const loginLimiter = require("../middlewares/rateLimiter");

router.post("/register", register);

router.post("/login", loginLimiter, login);

router.post("/logout", logout);

router.post("/refresh", refresh);

module.exports = router;

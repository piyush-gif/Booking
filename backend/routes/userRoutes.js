const express = require("express");
const router = express.Router();

const requireAdmin = require("../middlewares/admin");
const requireAuth = require("../middlewares/auth");
const {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", requireAuth, requireAdmin, getAllUsers);

router.get("/:id", requireAuth, getUser);

router.patch("/:id", requireAuth, updateUser);

router.delete("/:id", requireAuth, deleteUser);

module.exports = router;

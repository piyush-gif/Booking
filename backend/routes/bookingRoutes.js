const express = require("express");

const router = express.Router();

const requireAuth = require("../middlewares/auth");
const requireAdmin = require("../middlewares/admin");
const {
  getBooking,
  getUserBookings,
  getAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

router.get("/user-bookings", requireAuth, getUserBookings);

router.get("/", requireAuth, requireAdmin, getAllBookings);

router.post("/", requireAuth, createBooking);

router.get("/taken", requireAuth, getTakenSlots);

router.get("/:id", requireAuth, getBooking);

router.patch("/:id", requireAuth, updateBooking);

router.delete("/:id", requireAuth, deleteBooking);

module.exports = router;

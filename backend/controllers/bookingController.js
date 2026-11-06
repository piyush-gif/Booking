const mongoose = require("mongoose");
const Booking = require("../models/bookingSchema");

const PRICE_PER_HOUR = 1500;

const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;
const MAX_DAYS_AHEAD = 30;
const OPEN_HOUR = 6;
const CLOSE_HOUR = 22;

const parseSlot = (value) => {
  if (typeof value !== "string") {
    return { error: "A valid startTime is required" };
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { error: "A valid startTime is required" };
  }

  const nepal = new Date(date.getTime() + NEPAL_OFFSET_MS);
  if (nepal.getUTCMinutes() !== 0 || nepal.getUTCSeconds() !== 0) {
    return { error: "Bookings must start on the hour (Nepal time)" };
  }
  const hour = nepal.getUTCHours();
  if (hour < OPEN_HOUR || hour >= CLOSE_HOUR) {
    return { error: "Bookings run from 6 AM to 9 PM (Nepal time)" };
  }

  const now = new Date();
  if (date <= now) {
    return { error: "You can't book a slot in the past" };
  }
  const latest = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  if (date > latest) {
    return { error: `You can only book up to ${MAX_DAYS_AHEAD} days ahead` };
  }
  return { date };
};

const getTakenSlots = async (req, res) => {
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  if (isNaN(from) || isNaN(to) || to <= from) {
    return res.status(400).json({ error: "Valid from and to are required" });
  }
  try {
    const bookings = await Booking.find({
      startTime: { $gte: from, $lt: to },
      status: { $in: ["pending", "approved"] },
    }).select("startTime -_id");
    res.status(200).json(bookings.map((b) => b.startTime));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBooking = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    let query = { _id: id };

    if (role !== "admin") {
      query.userId = userId;
    }
    const booking = await Booking.findOne(query);
    if (!booking) {
      return res
        .status(404)
        .json({ error: "No booking found or unauthorized" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserBookings = async (req, res) => {
  const userId = req.user.id;
  try {
    const bookings = await Booking.find({ userId: userId });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate(
      "userId",
      "name phone email",
    );
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBooking = async (req, res) => {
  const userId = req.user.id;
  const { startTime } = req.body ?? {};

  const { error: slotError, date } = parseSlot(startTime);
  if (slotError) {
    return res.status(400).json({ error: slotError });
  }
  try {
    const booking = await Booking.create({
      userId,
      startTime: date,
      price: PRICE_PER_HOUR,
    });
    res.status(201).json(booking);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "This slot has just been booked. Try another time." });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  const data = req.body;

  if (!mongoose.Types.ObjectId.isValid(id) || !data) {
    return res.status(400).json({ error: "Invalid id or data" });
  }
  try {
    let query = { _id: id };
    if (role !== "admin") {
      query.userId = userId;
    }
    const booking = await Booking.findOne(query);
    if (!booking) {
      return res
        .status(404)
        .json({ error: "Booking not found or unauthorized" });
    }

    if (role !== "admin" && booking.status !== "pending") {
      return res.status(403).json({
        error:
          "This booking can no longer be changed. Please contact support to make changes.",
      });
    }

    const allowed =
      role === "admin"
        ? ["startTime", "price", "status", "paymentStatus"]
        : ["startTime", "status"];

    const updates = {};
    for (const field of allowed) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    if (
      role !== "admin" &&
      updates.status !== undefined &&
      updates.status !== "cancelled"
    ) {
      return res
        .status(403)
        .json({ error: "You can only cancel your own booking" });
    }

    if (updates.startTime !== undefined) {
      const { error: slotError, date } = parseSlot(updates.startTime);
      if (slotError) {
        return res.status(400).json({ error: slotError });
      }
      updates.startTime = date;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "This slot has just been booked. Try another time." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    let query = { _id: id };
    if (role !== "admin") {
      query.userId = userId;
    }
    const booking = await Booking.findOne(query);

    if (!booking) {
      return res
        .status(404)
        .json({ error: "Booking not found or unauthorized" });
    }
    if (role !== "admin" && booking.status !== "pending") {
      return res.status(403).json({
        error:
          "This booking can no longer be changed. Please contact support to make changes.",
      });
    }
    await Booking.findByIdAndDelete(id);
    res.status(200).json({ message: "Booking deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBooking,
  getUserBookings,
  getAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getTakenSlots,
};

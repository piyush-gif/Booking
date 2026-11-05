const Booking = require("../models/bookingSchema");

const getBooking = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }
  try {
    let query = { _id: id };

    if (role !== "admin") {
      query.userId = userId; //{ _id: id, userId: userId }
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
    const bookings = await Booking.find({});
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBooking = async (req, res) => {
  const userId = req.user.id;
  const { bookingDate, bookingTime, price } = req.body ?? {};
  try {
    const booking = await Booking.create({
      userId,
      bookingDate,
      bookingTime,
      price,
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  const data = req.body;

  if (!id || !data) {
    return res.status(400).json({ error: "Id required" });
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

    if (booking.status === true && role !== "admin") {
      return res.status(403).json({
        error:
          "This booking has already been accepted by the admin. Please contact support to make changes.",
      });
    }

    const allowed =
      role === "admin"
        ? ["bookingDate", "bookingTime", "price", "status", "paymentStatus"]
        : ["bookingDate", "bookingTime"];

    const updates = {};
    for (const field of allowed) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  if (!id) {
    return res.status(400).json({ error: "Id required" });
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
    if (role !== "admin" && booking.status === true) {
      return res.status(403).json({
        error:
          "This booking has already been accepted by the admin. Please contact support to make changes.",
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
};

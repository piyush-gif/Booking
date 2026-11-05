const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const RefreshToken = require("../models/refreshTokenSchema");

const getUser = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  if (!id) {
    return res.status(400).json({ error: "Invalid Id" });
  }
  try {
    if (role !== "admin" && id !== userId) {
      return res
        .status(403)
        .json({ error: "Access denied. You can only view your own profile." });
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "No user with that Id" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changePassword = async (req, res, next) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  const { oldPassword, newPassword } = req.body ?? {};
  try {
    if (id !== userId) {
      return res.status(403).json({
        error: "Access denied. You can only change your own password.",
      });
    }
    if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
      return res
        .status(400)
        .json({ error: "Old password and new password are required" });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "No user with that Id" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await RefreshToken.deleteMany({ user: id });

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  const data = req.body;
  if (!id || !data) {
    return res.status(400).json({ error: "Invalid id or data" });
  }
  try {
    if (role !== "admin" && id !== userId) {
      return res.status(403).json({
        error: "Access denied. You can only update your own profile.",
      });
    }

    const allowed =
      role === "admin" ? ["name", "phone", "role"] : ["name", "phone"];
    const updates = {};
    for (const field of allowed) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "No user with that Id" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;
  if (!id) {
    return res.status(400).json({ error: "Invalid Id" });
  }
  try {
    if (role !== "admin" && id !== userId) {
      return res.status(403).json({
        error: "Access denied. You can only delete your own account.",
      });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "No user with that Id" });
    }
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
};

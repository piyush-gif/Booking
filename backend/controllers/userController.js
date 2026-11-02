const User = require("../models/userSchema");

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

    if (role !== "admin" && data.role) {
      delete data.role;
    }
    const updateUser = await User.findByIdAndUpdate(
      id,
      { ...data },
      { returnDocument: "after", runValidators: true },
    ).select("-password");

    if (!updateUser) {
      return res.status(404).json({ error: "No user with that Id" });
    }
    res.status(200).json(updateUser);
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
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUser, getAllUsers, updateUser, deleteUser };

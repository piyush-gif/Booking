const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const requireAuth = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  try {
    const user = await User.findById(payload.sub).select("role");
    if (!user) return res.status(401).json({ error: "User no longer exists" });
    req.user = { id: payload.sub, role: user.role };
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = requireAuth;

const jwt = require("jsonwebtoken");

const requireAuth = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = requireAuth;

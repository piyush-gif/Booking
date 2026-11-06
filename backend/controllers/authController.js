const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userSchema");
const RefreshToken = require("../models/refreshTokenSchema");

const hashRefresh = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const isProd = process.env.NODE_ENV === "production";
const cookieBase = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
};
const refreshPath = process.env.REFRESH_COOKIE_PATH || "/auth";

const issueTokens = async (res, userId, role) => {
  const accessToken = jwt.sign(
    { sub: userId, role: role },
    process.env.ACCESS_TOKEN,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign({ sub: userId }, process.env.REFRESH_TOKEN, {
    expiresIn: "7d",
    jwtid: crypto.randomUUID(),
  });

  await RefreshToken.create({
    user: userId,
    hashedToken: hashRefresh(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.cookie("accessToken", accessToken, {
    ...cookieBase,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieBase,
    path: refreshPath,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, phone });
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "Email or phone is already in use" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Invalid email or password" });
  }
  try {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    const match = user && (await bcrypt.compare(password, user.password));
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    await issueTokens(res, user._id, user.role);
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN);
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
  try {
    const stored = await RefreshToken.findOneAndDelete({
      hashedToken: hashRefresh(token),
    });
    if (!stored) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    await issueTokens(res, user._id, user.role);
    res.status(200).json({ message: "Refreshed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  try {
    if (token) {
      await RefreshToken.deleteOne({ hashedToken: hashRefresh(token) });
    }
    res.clearCookie("accessToken", cookieBase);

    res.clearCookie("refreshToken", {
      ...cookieBase,
      path: refreshPath,
    });

    res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, logout, refresh, me };

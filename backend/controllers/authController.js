import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { Resend } from "resend";

const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const resendKey = process.env.RESEND_API_KEY;

// ✅ Initialize Resend only if API key exists
let resend = null;
if (resendKey) {
  resend = new Resend(resendKey);
} else {
  console.warn("⚠️ Warning: RESEND_API_KEY not found in .env file!");
}

// ✅ Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email ,avatar: user.avatar},
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email ,avatar: user.avatar},
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ Edit Profile
export const editProfile = async (req, res) => {
  try {
    const { name, profession, avatar } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, profession, avatar },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Edit Profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ✅ Send Password Reset Link
export const sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    if (!resend)
      return res
        .status(500)
        .json({ message: "Email service unavailable. Missing RESEND_API_KEY." });

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Yadam.ai <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password - Yadam.ai",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to reset it (valid for 15 minutes):</p>
          <a href="${resetLink}" 
             style="display:inline-block; background:#4F46E5; color:white; padding:10px 20px; 
             border-radius:5px; text-decoration:none;">Reset Password</a>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("❌ Send Reset Link error:", error);
    res.status(500).json({ message: "Failed to send password reset link" });
  }
};

// ✅ Verify Reset Token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) return res.status(400).json({ message: "Invalid token" });
    res.status(200).json({ message: "Valid token", userId: decoded.id });
  } catch (error) {
    console.error("❌ Verify token error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res
        .status(400)
        .json({ message: "Token and new password are required" });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) return res.status(400).json({ message: "Invalid token" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset Password error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// ✅ Get Logged-in User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Get Profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

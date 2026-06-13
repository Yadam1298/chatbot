import express from "express";
import {
  registerUser,
  loginUser,
  editProfile,
  sendResetLink,
  verifyResetToken,
  resetPassword,
  getUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Only ONE route for profile GET
router.get("/profile", protect, getUserProfile);

// ✅ Edit profile
router.put("/profile", protect, editProfile);

// ✅ Password reset flow
router.post("/send-reset-link", sendResetLink);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password", resetPassword);

export default router;

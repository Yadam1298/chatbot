import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserProfile, editProfile } from "../controllers/authController.js";

const router = express.Router();

// ✅ Get user profile
router.get("/", protect, getUserProfile);

// ✅ Update user profile
router.put("/", protect, editProfile);

export default router;

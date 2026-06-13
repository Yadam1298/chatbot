import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    // Default values for optional fields 👇
    profession: { type: String, default: "Not specified" },
    avatar: {
      type: String,
      default: "https://i.ibb.co/V0hS7g4L/Screenshot-2025-10-30-141814.png",
    },

    resetOTP: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

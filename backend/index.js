// --- Imports ---
import dotenv from "dotenv";
dotenv.config();


import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";

// --- Import Routes ---
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

// --- Initialize Express ---
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Hugging Face API Setup ---
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error("❌ HF_TOKEN not found in environment variables");
  process.exit(1);
}

const hfHeaders = {
  Authorization: `Bearer ${HF_TOKEN}`,
  "Content-Type": "application/json",
};

// --- Hugging Face Chat Route (Unified AI API) ---
app.post("/api/chat", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "No 'content' provided in body" });
    }

    const payload = {
      model: "Qwen/Qwen2.5-Coder-32B-Instruct:nscale",
      messages: [{ role: "user", content }],
    };

    const response = await axios.post(HF_API_URL, payload, { headers: hfHeaders });

    if (response.data?.choices?.length > 0) {
      const aiResponse = response.data.choices[0].message.content;
      return res.json({ response: aiResponse });
    } else {
      console.error("Empty response from HF:", response.data);
      return res.status(500).json({ error: "Model returned no output" });
    }
  } catch (err) {
    console.error("Error contacting HF API:", err.response?.data || err.message);
    return res.status(502).json({
      error: "Failed to contact Hugging Face API",
      details: err.response?.data || err.message,
    });
  }
});

// --- Use Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/profile", profileRoutes);

// --- Root Route ---
app.get("/", (req, res) => {
  res.send("🤖 Unified ChatBot API (Node + Hugging Face + MongoDB) is running...");
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

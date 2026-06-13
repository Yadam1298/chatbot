import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error("❌ HF_TOKEN missing from .env");
  process.exit(1);
}

const hfHeaders = {
  Authorization: `Bearer ${HF_TOKEN}`,
  "Content-Type": "application/json",
};

// Mistral model handler (chat API)
async function handleMistralModel(content, model) {
  try {
    const data = {
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
      model: model,
      max_tokens: 200,
      temperature: 0.7,
    };

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    const aiResponse =
      result?.choices?.[0]?.message?.content || JSON.stringify(result) || "⚠️ No response from Mistral model.";
    return aiResponse;
  } catch (err) {
    console.error("❌ Error in handleMistralModel:", err.message);
    throw new Error("Failed to contact Mistral model");
  }
}

// Default Hugging Face model handler
async function handleHuggingFaceModel(content, model) {
  try {
    const payload = { inputs: content };
    const response = await fetch(`${HF_API_URL}/${model}`, {
      method: "POST",
      headers: hfHeaders,
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    const aiResponse = result?.[0]?.generated_text || JSON.stringify(result) || "⚠️ No response from Hugging Face model.";
    return aiResponse;
  } catch (err) {
    console.error("❌ Error in handleHuggingFaceModel:", err.message);
    throw new Error("Failed to contact Hugging Face API");
  }
}

// Main chat endpoint for direct calls (if needed)
async function chatEndpoint(req, res) {
  try {
    const { content, model } = req.body;
    if (!content) return res.status(400).json({ error: "No message provided." });

    const selectedModel = model || "mistralai/Mistral-7B-Instruct-v0.2";
    let aiResponse = "";

    if (selectedModel.toLowerCase().includes("mistral")) {
      aiResponse = await handleMistralModel(content, selectedModel);
    } else {
      aiResponse = await handleHuggingFaceModel(content, selectedModel);
    }

    res.json({ userMessage: content, aiMessage: aiResponse, model: selectedModel });
  } catch (err) {
    console.error("Error in chatEndpoint:", err.message);
    res.status(502).json({ error: "Chat request failed", details: err.message });
  }
}

app.post("/api/chat", chatEndpoint); // singular direct AI endpoint

// Other routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes); // chatRoutes handles chat and message endpoints
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => res.send("🤖 Unified ChatBot API running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

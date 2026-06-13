import Chat from "../models/Chat.js";
import fetch from "node-fetch";

const HF_API_URL = "https://api-inference.huggingface.co/models";
const HF_TOKEN = process.env.HF_TOKEN;

const hfHeaders = {
  Authorization: `Bearer ${HF_TOKEN}`,
  "Content-Type": "application/json",
};

// ------- DEEPSEEK MODEL HANDLER ----------
async function handleDeepSeekModel(content, model) {
  try {
    const data = {
      messages: [
        {
          role: "user",
          content,
        },
      ],
      model: model || "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B:featherless-ai",
      max_tokens: 300,
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

    if (result.error) {
      return `⚠️ DeepSeek error: ${result.error.message || result.error}\n\nCheck Hugging Face account/token or select another supported model.`;
    }

    if (result && Array.isArray(result.choices)) {
      const message = result.choices[0]?.message;
      if (message && typeof message.content === "string") {
        return message.content;
      }
    }

    return "⚠️ No response from Deepseek model. Please try again with a different model.";
  } catch (err) {
    console.error("Error handleDeepSeekModel:", err.message);
    return "⚠️ DeepSeek handler failed.";
  }
}


// ------- QWEN MODEL HANDLER ----------
async function handleQwenModel(content, model) {
  try {
    const data = {
      messages: [
        {
          role: "user",
          content,
        },
      ],
      model: model || "Qwen/Qwen2.5-7B-Instruct:together",
      max_tokens: 300,
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

    if (result.error) {
      return `⚠️ Qwen error: ${result.error.message || result.error}\n\nCheck Hugging Face account/token or select another supported model.`;
    }

    if (result && Array.isArray(result.choices)) {
      const message = result.choices[0]?.message;
      if (message && typeof message.content === "string") {
        return message.content;
      }
    }

    return "⚠️ No response from Qwen model. Please try again with a different model.";
  } catch (err) {
    console.error("Error handleQwenModel:", err.message);
    return "⚠️ Qwen handler failed.";
  }
}

// ------- LLAMA MODEL HANDLER ----------
async function handleLlamaModel(content, model) {
  try {
    const data = {
      messages: [
        {
          role: "user",
          content,
        },
      ],
      model: model || "meta-llama/Llama-2-7b-chat-hf",
      max_tokens: 300,
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

    if (result.error) {
      return `⚠️ Llama error: ${result.error.message || result.error}\n\nCheck Hugging Face account/token or select another supported model.`;
    }

    if (result && Array.isArray(result.choices)) {
      const message = result.choices[0]?.message;
      if (message && typeof message.content === "string") {
        return message.content;
      }
    }

    return "⚠️ No response from Llama model. Please try again with a different model.";
  } catch (err) {
    console.error("Error handleLlamaModel:", err.message);
    return "⚠️ Llama handler failed.";
  }
}

// ------- GEMMA MODEL HANDLER ----------
async function handleGemmaModel(content, model) {
  try {
    const data = {
      messages: [
        {
          role: "user",
          content,
        },
      ],
      model: model || "google/gemma-2b-it",
    };
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log("Gemma result:", JSON.stringify(result, null, 2));
    if (result.error) {
      const errMsg = result.error.message || result.error;
      if (
        errMsg.includes("not supported by any provider") ||
        errMsg.includes("not found") ||
        errMsg.includes("invalid provider")
      ) {
        console.warn("⚠️ Falling back to Hugging Face inference API for Gemma...");
        const fallbackResponse = await fetch(
          `https://api-inference.huggingface.co/models/google/gemma-2b-it`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: content }),
          }
        );
        const fallbackResult = await fallbackResponse.json();
        if (Array.isArray(fallbackResult) && fallbackResult.length > 0) {
          return fallbackResult[0].generated_text || "⚠️ No output from fallback API.";
        } else if (fallbackResult.generated_text) {
          return fallbackResult.generated_text;
        }
        return `⚠️ Fallback also failed: ${JSON.stringify(fallbackResult)}`;
      }
      return `⚠️ Gemma error: ${errMsg}\n\nCheck Hugging Face account/token or select a supported model.`;
    }
    if (result && Array.isArray(result.choices)) {
      const message = result.choices[0]?.message;
      if (message && typeof message.content === "string") {
        return message.content;
      }
    }
    return "⚠️ No response from Gemma model. Please try again with a different model.";
  } catch (err) {
    console.error("Error handleGemmaModel:", err.message);
    return "⚠️ Gemma handler failed.";
  }
}

// ------- MISTRAL MODEL HANDLER ----------
async function handleMistralModel(content, model) {
  try {
    const data = {
      messages: [{ role: "user", content }],
      model,
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
    if (result.error) {
      return `⚠️ Mistral error: ${result.error.message}\n\nCheck Hugging Face account/token or select another supported model.`;
    }
    return result?.choices?.[0]?.message?.content || "⚠️ No response from Mistral model.";
  } catch (err) {
    console.error("Error handleMistralModel:", err.message);
    return "⚠️ Mistral handler failed.";
  }
}

// ------- DEFAULT HUGGINGFACE TEXT GENERATION HANDLER ----------
async function handleHuggingFaceModel(content, model) {
  try {
    const payload = { inputs: content };
    const response = await fetch(`${HF_API_URL}/${model}`, {
      method: "POST",
      headers: hfHeaders,
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (result.error) {
      return `⚠️ HF error: ${result.error}\n\nSelect a supported model or check your Hugging Face API permissions.`;
    }
    if (Array.isArray(result) && result.length > 0) {
      return result[0].generated_text || "";
    } else if (result.generated_text) {
      return result.generated_text;
    }
    return "⚠️ No response from Hugging Face model.";
  } catch (err) {
    console.error("Error handleHuggingFaceModel:", err.message);
    return "⚠️ HF model handler failed.";
  }
};

/** Get all chats for logged-in user */
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Server error fetching chats" });
  }
};

/** Get chat by ID */
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ message: "Server error fetching chat" });
  }
};

/** Add message + AI reply and store both in DB */
export const addMessageToChat = async (req, res) => {
  const { sender, text, model } = req.body;
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push({ sender, text });

    let botReply = "⚠️ AI service unavailable. Please try again later.";

    try {
      const selectedModel = model || "mistralai/Mistral-7B-Instruct-v0.2";
      if (selectedModel.toLowerCase().includes("deepseek")) {
        botReply = await handleDeepSeekModel(text, selectedModel);
      } else if (selectedModel.toLowerCase().includes("qwen")) {
        botReply = await handleQwenModel(text, selectedModel);
      } else if (selectedModel.toLowerCase().includes("llama")) {
        botReply = await handleLlamaModel(text, selectedModel);
      } else if (selectedModel.toLowerCase().includes("mistral")) {
        botReply = await handleMistralModel(text, selectedModel);
      } else if (selectedModel.toLowerCase().includes("gemma")) {
        botReply = await handleGemmaModel(text, selectedModel);
      } else {
        botReply = await handleHuggingFaceModel(text, selectedModel);
      }
      if (!botReply) {
        botReply = "⚠️ No response from model.";
      }
    } catch (err) {
      console.error("AI model fetch error:", err.message);
    }

    chat.messages.push({ sender: "bot", text: botReply });

    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Error saving message" });
  }
};

/** Create new chat */
export const createChat = async (req, res) => {
  try {
    const newChat = new Chat({
      user: req.user.id,
      title: req.body.title || "New Chat",
      messages: [],
    });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: "Error creating chat" });
  }
};

/** Delete a chat */
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Server error deleting chat" });
  }
};

/** Update chat title */
export const updateChatTitle = async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title: req.body.title },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.json(chat);
  } catch (error) {
    console.error("Error updating chat title:", error);
    res.status(500).json({ message: "Error updating chat title" });
  }
};

import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import {
  getAllChats,
  getChatById,
  addMessageToChat,
  createChat,
  deleteChat,
  updateChatTitle,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", verifyToken, getAllChats);
router.get("/:id", verifyToken, getChatById);
router.post("/", verifyToken, createChat);
router.post("/:id/message", verifyToken, addMessageToChat);
router.delete("/:id", verifyToken, deleteChat);
router.put("/:id", verifyToken, updateChatTitle);

export default router;

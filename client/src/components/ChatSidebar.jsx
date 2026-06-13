import React, { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ChatSidebar({ onSelectChat, currentChatId, onDeleteChat }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [chats, setChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  // ✅ Fetch chats from backend
  const fetchChats = async () => {
    try {
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    fetchChats();
  }, [location.pathname]);

  const handleSelect = (chatId) => {
    navigate(`/chat/${chatId}`);
    if (onSelectChat) onSelectChat(chatId);
  };

  const handleDelete = async (chatId) => {
    try {
      await axios.delete(`http://localhost:5000/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (onDeleteChat) onDeleteChat(chatId);
      setMenuOpenId(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleRename = (chat) => {
    setEditingChatId(chat._id);
    setNewTitle(chat.title);
    setMenuOpenId(null);
  };

  const saveUpdatedTitle = async (chatId) => {
    if (!newTitle.trim()) return;
    try {
      await axios.put(
        `http://localhost:5000/api/chats/${chatId}`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchChats();
      setEditingChatId(null);
      setNewTitle("");
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  if (!user || !token) {
    return null;
  }

  // 🧩 Get user initials or avatar
  const getUserInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col w-64 bg-[#0e0e10] text-gray-200 border-r border-gray-800 h-screen sticky top-0">
      {/* Header with Avatar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">My Chats</h2>

        {/* 🧠 User Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getUserInitials(user?.name)
          )}
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chats.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-10">No chats yet</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                chat._id === currentChatId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              <div className="flex-1 truncate" onClick={() => handleSelect(chat._id)}>
                {editingChatId === chat._id ? (
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => saveUpdatedTitle(chat._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveUpdatedTitle(chat._id);
                    }}
                    autoFocus
                    className="bg-transparent border-b border-gray-400 text-sm w-full outline-none"
                  />
                ) : (
                  <span className="truncate text-sm">{chat.title}</span>
                )}
              </div>

              {/* Options Menu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === chat._id ? null : chat._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-600 transition ml-2"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpenId === chat._id && (
                <div
                  className="absolute right-2 top-10 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20 w-36"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleRename(chat)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition"
                  >
                    ✏️ Rename
                  </button>
                  <button
                    onClick={() => handleDelete(chat._id)}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-red-400 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 text-xs text-gray-500 text-center">
        <p>{user?.name}</p>
      </div>
    </div>
  );
}

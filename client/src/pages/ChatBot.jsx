import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatHeader from "../components/ChatHeader.jsx";
import ChatInput from "../components/ChatInput.jsx";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, ThumbsUp, ThumbsDown, Flag, Edit3 } from "lucide-react";
import ReportModal from "../components/ReportModal.jsx";
import axios from "axios";

const CHAT_API = "http://localhost:5000/api/chats";

export default function ChatBot() {
  const { chatId } = useParams();
  const [conversation, setConversation] = useState([]);
  const [activeChat, setActiveChat] = useState(chatId || null);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const [liked, setLiked] = useState({});
  const [disliked, setDisliked] = useState({});
  const [copySuccess, setCopySuccess] = useState({});
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportedMsg, setReportedMsg] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }
        const response = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("user", JSON.stringify(response.data));
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [conversation, loading]);

  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = !!localStorage.getItem("token");
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        setConversation([]);
        setActiveChat(null);
      }
    };
    window.addEventListener("storage", checkLogin);
    checkLogin();
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  useEffect(() => {
    if (chatId && isLoggedIn) loadChatMessages(chatId);
  }, [chatId, isLoggedIn]);

  const loadChatMessages = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);
    try {
      const res = await fetch(`${CHAT_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data && Array.isArray(data.messages)) {
        setConversation(data.messages);
        setActiveChat(id);
      } else if (data && Array.isArray(data.chat?.messages)) {
        setConversation(data.chat.messages);
        setActiveChat(id);
      } else {
        setConversation([]);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const createNewChat = async (firstMessageText) => {
    const token = localStorage.getItem("token");
    if (!token) return setShowLoginModal(true);
    try {
      const res = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: firstMessageText.substring(0, 30) || "New Chat" }),
      });
      const newChat = await res.json();
      if (newChat && newChat._id) {
        setActiveChat(newChat._id);
        navigate(`/chat/${newChat._id}`, { replace: true });
      }
      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      return null;
    }
  };

  const simulateTyping = (fullText) => {
    let index = 0;
    let displayText = "";
    const typingSpeed = 5;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    return new Promise((resolve) => {
      typingIntervalRef.current = setInterval(() => {
        if (index < fullText.length) {
          displayText += fullText[index++];
          setConversation((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.sender === "bot" && (last.text === "..." || index > 1)) {
              last.text = displayText;
            }
            return copy;
          });
        } else {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
          resolve();
        }
      }, typingSpeed);
    });
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  // Updated sendMessage: passes selectedModel to backend message endpoint
  const sendMessage = async (userMessage, selectedModel) => {
    if (!userMessage.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("pendingMessage", userMessage);
      return setShowLoginModal(true);
    }
    let id = activeChat;
    let isNewChat = !id;

    setConversation((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
      { sender: "bot", text: "..." },
    ]);
    setLoading(true);

    try {
      if (isNewChat) {
        const res = await fetch(CHAT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: userMessage.substring(0, 30) || "New Chat" }),
        });
        const newChat = await res.json();
        id = newChat?._id;
        if (!id) throw new Error("Failed to create new chat.");
        setActiveChat(id);
        navigate(`/chat/${id}`, { replace: true });
      }

      // Send message with model info
      const res = await fetch(`${CHAT_API}/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sender: "user", text: userMessage, model: selectedModel }),
      });
      await res.json();

      const refreshed = await fetch(`${CHAT_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestData = await refreshed.json();
      let updatedMessages = [];
      if (latestData && Array.isArray(latestData.messages)) updatedMessages = latestData.messages;
      else if (latestData && Array.isArray(latestData.chat?.messages)) updatedMessages = latestData.chat.messages;
      setConversation(updatedMessages);

      let botReply = "An error occurred fetching the response.";
      const botMessage = updatedMessages.slice(-1)[0];
      if (botMessage && botMessage.sender === "bot") botReply = botMessage.text;
      if (botReply && typeof botReply === "string") {
        await simulateTyping(botReply);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setConversation((prev) => {
        const filtered = prev.filter((m) => m.text !== "...");
        return [...filtered, { sender: "bot", text: "Connection error. Please try again." }];
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${CHAT_API}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (id === activeChat) {
        setConversation([]);
        setActiveChat(null);
        navigate("/chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleCopyClick = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopySuccess((prev) => ({ ...prev, [key]: false })), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleLike = (i) => {
    setLiked((prev) => ({ ...prev, [i]: !prev[i] }));
    setDisliked((prev) => ({ ...prev, [i]: false }));
  };

  const handleDislike = (i) => {
    setDisliked((prev) => ({ ...prev, [i]: !prev[i] }));
    setLiked((prev) => ({ ...prev, [i]: false }));
  };

  const handleReport = (msg) => {
    setReportedMsg(msg);
    setShowReportModal(true);
  };

  const handleEdit = (i, text) => {
    setEditingMessage(i);
    setEditText(text);
  };

  const handleSaveEdit = (i) => {
    setConversation((prev) =>
      prev.map((m, index) => (index === i ? { ...m, text: editText } : m))
    );
    setEditingMessage(null);
    setEditText("");
  };

  const startNewChatUI = () => {
    setConversation([]);
    setActiveChat(null);
    navigate("/chat");
  };

  const safeText = (text) => {
    if (typeof text === "string") return text;
    if (Array.isArray(text)) return text.join(" ");
    if (typeof text === "object" && text !== null) return JSON.stringify(text);
    return "";
  };

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const code = safeText(children);
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";
    const isBlock = !!match;
    const key = `${language}-${code.substring(0, 10)}-${Math.random()}`;

    if (isBlock) {
      return (
        <div className="relative bg-gray-700 rounded-lg my-4 overflow-x-auto text-sm">
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-600">
            <span className="text-xs font-mono text-gray-400 uppercase">{language}</span>
            <button
              onClick={() => handleCopyClick(code, key)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition"
            >
              {copySuccess[key] ? (
                <>
                  <Check size={16} /> <span className="text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} /> <span className="text-xs">Copy code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }

    return (
      <code
        className="px-1 rounded bg-gray-800 text-blue-400 font-mono text-[.95em] break-words"
        {...props}
      >
        {children}
      </code>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {isLoggedIn && (
        <ChatSidebar
          onSelectChat={loadChatMessages}
          currentChatId={activeChat}
          onDeleteChat={deleteChat}
          onNewChat={startNewChatUI}
        />
      )}

      <div className="flex-1 flex flex-col relative">
        <ChatHeader onNewChat={startNewChatUI} />

        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-80 text-center border border-gray-700">
              <h2 className="text-xl font-semibold mb-3 text-white">Login Required</h2>
              <p className="text-gray-300 mb-5">You need to log in to use this chatbot.</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          {conversation.length === 0 ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center space-y-5">
              <h1 className="text-4xl font-bold text-gray-100">
                Welcome to <span className="text-blue-500 font-extrabold">Yad</span>am.ai
              </h1>
              <p className="text-gray-400 max-w-md">Powered By Yadam Naga Venkata Naveen Kumar</p>
              <div className="w-full max-w-2xl mt-10 px-4">
                <ChatInput onSend={isLoggedIn ? sendMessage : () => setShowLoginModal(true)} loading={loading} />
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-y-auto h-full flex flex-col items-center px-4 pb-[140px] pt-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <div className="w-full max-w-3xl space-y-6">
                  {conversation.map((msg, i) => (
                    <div
                      key={msg._id || i}
                      className={`flex w-full ${msg.sender === "user" ? "justify-end mb-6" : "justify-start"}`}
                    >
                      <div
                        className={`group relative w-fit max-w-full sm:max-w-[85%] p-4 rounded-2xl text-base leading-relaxed shadow-md break-words transition-all ${
                          msg.sender === "user"
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white self-end"
                            : "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 border border-gray-700 self-start"
                        }`}
                      >
                        {editingMessage === i ? (
                          <div className="flex flex-col gap-3 mt-2 w-full sm:w-[600px] animate-fadeIn">
                            <div className="relative w-full">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-3 pr-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 border border-gray-700 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 h-[150px]"
                                placeholder="Edit your message..."
                                autoFocus
                              />
                            </div>
                            <div className="flex justify-end gap-2 text-sm w-full">
                              <button
                                onClick={() => setEditingMessage(null)}
                                className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(i)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 transition-all shadow-md hover:shadow-blue-500/30"
                              >
                                send
                              </button>
                            </div>
                          </div>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: CodeBlock,
                              a: ({ node, ...props }) => (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 underline"
                                />
                              ),
                            }}
                          >
                            {msg.text === "..." ? "..." : safeText(msg.text)}
                          </ReactMarkdown>
                        )}

                        {msg.sender === "bot" ? (
                          <div className="absolute -bottom-8 left-0 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => handleCopyClick(safeText(msg.text), `bot-${i}`)}
                              className="text-gray-400 hover:text-white transition-transform hover:scale-110"
                              title="Copy"
                            >
                              {copySuccess[`bot-${i}`] ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            <button
                              onClick={() => handleLike(i)}
                              className={`hover:scale-110 ${liked[i] ? "text-green-400" : "text-gray-400 hover:text-green-400"}`}
                              title="Like"
                            >
                              <ThumbsUp size={16} fill={liked[i] ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={() => handleDislike(i)}
                              className={`hover:scale-110 ${disliked[i] ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
                              title="Dislike"
                            >
                              <ThumbsDown size={16} fill={disliked[i] ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={() => handleReport(msg)}
                              className="text-gray-400 hover:text-yellow-400 hover:scale-110"
                              title="Report"
                            >
                              <Flag size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="absolute -bottom-8 right-0 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => handleCopyClick(safeText(msg.text), `user-${i}`)}
                              className="text-gray-300 hover:text-white hover:scale-110"
                              title="Copy"
                            >
                              {copySuccess[`user-${i}`] ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            <button
                              onClick={() => handleEdit(i, msg.text)}
                              className="text-gray-300 hover:text-blue-400 hover:scale-110"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {showReportModal && (
                    <ReportModal message={reportedMsg} onClose={() => setShowReportModal(false)} />
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              <div className="absolute left-0 w-full bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-1 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] bottom-0">
                <div className="max-w-3xl mx-auto w-full">
                  <ChatInput onSend={sendMessage} loading={loading} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

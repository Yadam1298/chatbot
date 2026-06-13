import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, LogIn, UserPlus, XCircle } from "lucide-react";

export default function ChatHeader({ onNewChat }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowPopup(true);
    setMenuOpen(false);

    navigate("/chat", { replace: true });
    window.dispatchEvent(new Event("storage"));
    setTimeout(() => setShowPopup(false), 2000);
  };

  // New Chat Handler
  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    } else {
      navigate("/chat/");
    }
  };

  return (
    <>
      <header className="py-3 px-6 bg-gray-900 border-b border-gray-800 shadow-sm sticky top-0 z-10 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={handleNewChat}
          className="text-lg font-semibold text-white select-none cursor-pointer hover:text-blue-400 transition"
        >
          <span className="text-blue-400">Yad</span>am.ai
        </div>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-sm text-gray-300 hover:text-white transition flex items-center space-x-2"
          >
            {user ? (
              <>
                <span className="hidden sm:inline">
                  Welcome{" "}
                  <span className="text-blue-400 font-medium">
                    {user?.name || "User"}
                  </span>
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    menuOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            ) : (
              <span className="text-blue-400 font-medium">Login/Register</span>
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 animate-fadeIn">
              {user ? (
                <>
                  {/* ✅ Navigate to Profile */}
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  >
                    <User size={14} className="mr-2" /> Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition"
                  >
                    <LogOut size={14} className="mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  >
                    <LogIn size={14} className="mr-2" /> Login
                  </button>

                  <button
                    onClick={() => {
                      navigate("/register");
                      setMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  >
                    <UserPlus size={14} className="mr-2" /> Register
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Logout Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeIn">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 w-80 text-center animate-fadeInUp">
            <XCircle className="mx-auto mb-3 text-red-400" size={40} />
            <h2 className="text-lg font-semibold text-white">Logged Out</h2>
            <p className="text-gray-400 text-sm mt-1">
              You’ve been logged out successfully.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(true);

  // ✅ Check token validity when page loads
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      showPopup("❌ Invalid or missing token!");
    }
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!token) {
      showPopup("❌ Invalid link — please request a new one.");
      return;
    }

    if (password.length < 8) {
      showPopup("❌ Password must be at least 8 characters long!");
      return;
    }

    if (password !== confirm) {
      showPopup("❌ Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Correct format: send token and newPassword in JSON body
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      showPopup("✅ Password reset successful!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Reset error:", err);
      showPopup("❌ Link expired or invalid!");
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (msg) => {
    setPopupMessage(msg);
    setTimeout(() => setPopupMessage(""), 2500);
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] via-[#121d33] to-[#1e2a3a] text-gray-200 px-4">
        <div className="bg-[#1a2434]/70 p-8 rounded-2xl shadow-xl border border-red-500/40 text-center">
          <XCircle className="mx-auto mb-3 text-red-500" size={50} />
          <h2 className="text-lg font-semibold text-gray-200">
            Invalid or expired reset link.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1c] via-[#121d33] to-[#1e2a3a] text-gray-200 px-4 relative overflow-hidden">
      {/* Floating Background Lights */}
      <div className="absolute w-72 h-72 bg-blue-800/20 blur-3xl rounded-full -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-80 h-80 bg-blue-500/10 blur-3xl rounded-full bottom-0 right-0 animate-pulse"></div>

      {/* Reset Card */}
      <div className="w-full max-w-md backdrop-blur-xl bg-[#1a2434]/70 border border-[#2c3e50]/40 rounded-2xl p-8 shadow-2xl shadow-black/60 animate-fadeIn">
        <h1 className="text-3xl font-semibold text-center mb-8 text-blue-400">
          🔒 Reset Your Password
        </h1>

        <form onSubmit={handleReset} className="space-y-6">
          {/* New Password */}
          <div className="relative">
            <Lock className="absolute top-3 left-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f1729] border border-[#2c3e50]/50 rounded-lg py-3 pl-10 pr-10 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
            {showPassword ? (
              <EyeOff
                size={18}
                onClick={() => setShowPassword(false)}
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-blue-400 transition"
              />
            ) : (
              <Eye
                size={18}
                onClick={() => setShowPassword(true)}
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-blue-400 transition"
              />
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute top-3 left-3 text-gray-400" size={18} />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-[#0f1729] border border-[#2c3e50]/50 rounded-lg py-3 pl-10 pr-10 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
            {showConfirm ? (
              <EyeOff
                size={18}
                onClick={() => setShowConfirm(false)}
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-blue-400 transition"
              />
            ) : (
              <Eye
                size={18}
                onClick={() => setShowConfirm(true)}
                className="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-blue-400 transition"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-200 ${
              loading
                ? "bg-gradient-to-r from-blue-700 to-blue-900 opacity-70 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 shadow-lg shadow-blue-800/40"
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Popup Modal */}
      {popupMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div
            className={`flex flex-col items-center justify-center bg-[#1a2434]/90 border rounded-2xl shadow-2xl px-10 py-8 w-[320px] transition-all ${
              popupMessage.startsWith("✅")
                ? "border-green-500/40"
                : "border-red-500/40"
            }`}
          >
            {popupMessage.startsWith("✅") ? (
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 animate-pulse">
                <CheckCircle size={50} className="text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 animate-pulse">
                <XCircle size={50} className="text-white" />
              </div>
            )}

            <p className="text-center text-gray-200 text-sm font-medium">
              {popupMessage.replace("✅", "").replace("❌", "").trim()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import axios from "axios";
import { Mail, CheckCircle, XCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showPopup("❌ Please enter your email!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/send-reset-link", { email });

      if (res.status === 200 || res.status === 202) {
        showPopup("✅ Reset link sent to your email!");
      } else {
        showPopup("❌ Failed to send reset link!");
      }
    } catch (err) {
      console.error("Error:", err);
      showPopup("❌ Email not found or server error!");
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (msg) => {
    setPopupMessage(msg);
    setTimeout(() => setPopupMessage(""), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200 px-4 relative overflow-hidden">
      <div className="absolute w-80 h-80 bg-cyan-800/10 blur-3xl rounded-full -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-blue-800/10 blur-3xl rounded-full bottom-0 right-0 animate-pulse"></div>

      <div className="w-full max-w-md backdrop-blur-lg bg-gray-800/60 border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold text-center text-cyan-400 mb-6">
          Forgot Password 🔑
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8">
          Enter your registered email to receive a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute top-3 left-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900/70 border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-black font-semibold transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-[1.02] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "🔄 Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>

      {/* Popup Message */}
      {popupMessage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className={`flex flex-col items-center bg-gray-800/90 border rounded-2xl shadow-2xl px-10 py-8 w-[320px] ${
              popupMessage.startsWith("✅")
                ? "border-green-500/40"
                : "border-red-500/40"
            }`}
          >
            {popupMessage.startsWith("✅") ? (
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mb-4 shadow-lg animate-pulse">
                <CheckCircle size={50} className="text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mb-4 shadow-lg animate-pulse">
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

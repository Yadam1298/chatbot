import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      const { token, user } = res.data;

      // ✅ Save both token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("✅ Login successful!");
      setTimeout(() => navigate("/chat", { state: { justLoggedIn: true } }), 1000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Invalid credentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 relative overflow-hidden">

      {/* Animated background balls */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-cyan-500/10 rounded-full blur-3xl animate-float"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 8 + 6}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl p-8 shadow-2xl shadow-cyan-900/20 relative z-10">
        <h2 className="text-3xl font-semibold text-center text-cyan-400 mb-2 tracking-wide drop-shadow-md">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Sign in to access your dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="text-gray-300 text-xs block mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="off"
              className="w-full bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200"
              onChange={handleChange}
              value={formData.email}
            />
          </div>

          {/* Password field */}
          <div>
            <label className="text-gray-300 text-xs block mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full bg-gray-900/70 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-200"
              onChange={handleChange}
              value={formData.password}
            />
          </div>

          {/* ✅ Forgot Password Link */}
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-cyan-400 text-xs hover:text-cyan-300 hover:underline transition"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold py-2.5 rounded-md text-sm transition-all duration-300 shadow-lg hover:scale-[1.02] ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "🔄 Logging in..." : "Login"}
          </button>
        </form>

        {/* Status message */}
        {message && (
          <p
            className={`text-center mt-3 text-xs font-medium transition-all duration-300 ${
              message.includes("✅")
                ? "text-green-400"
                : message.includes("🔄")
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        {/* Register link */}
        <p className="mt-6 text-center text-gray-400 text-xs">
          Don’t have an account?{" "}
          <button
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition"
            onClick={() => navigate("/register")}
          >
            Register here
          </button>
        </p>
      </div>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

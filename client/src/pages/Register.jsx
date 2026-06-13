import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("🔄 Creating account...");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      const { token, user } = res.data;

      // ✅ Auto-login after registration
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("✅ Registration successful!");
      setTimeout(() => navigate("/chat"), 1200);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Registration failed"));
    }
  };



  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-sm bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-cyan-400 mb-2 tracking-wide">
          Create Account
        </h2>
        <p className="text-center text-gray-400 mb-6 text-xs">
          Join us to start your AI journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-xs block mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your Full Name"
              required
              className="w-full bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-gray-300 text-xs block mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              className="w-full bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="text-gray-300 text-xs block mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-medium py-2.5 rounded-md text-sm hover:scale-[1.02] transition-transform duration-300 shadow-md"
          >
            Register
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-3 text-xs ${message.includes("✅")
              ? "text-green-400"
              : message.includes("🔄")
                ? "text-yellow-400"
                : "text-red-400"
              }`}
          >
            {message}
          </p>
        )}

        <p className="mt-5 text-center text-gray-400 text-xs">
          Already have an account?{" "}
          <button
            className="text-cyan-400 hover:text-cyan-300 hover:underline transition"
            onClick={() => navigate("/login")}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

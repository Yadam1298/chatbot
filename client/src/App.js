import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ChatBot from "./pages/ChatBot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import ResetPassword from "./components/ResetPassword";
import ForgotPassword from "./components/ForgotPassword";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<ChatBot />} />
        <Route path="/chat/:chatId" element={<ChatBot />} /> {/* ✅ dynamic route */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}

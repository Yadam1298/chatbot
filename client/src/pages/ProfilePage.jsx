import React, { useState, useEffect } from "react";
import {
  Camera,
  Save,
  X,
  Loader2,
  Mail,
  Calendar,
  ArrowLeft,
  Lock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setErrorMessage("Failed to load profile. Check your backend or connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 3000);
  };

  const handleEdit = () => {
    setTempUser({ ...user });
    setIsEditing(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempUser((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tempUser),
      });

      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setUser(data.user ?? data);
      setIsEditing(false);
      showPopup("✅ Profile saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      showPopup("❌ Error saving profile.");
      setErrorMessage("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      showPopup("⚠️ No email found for this user!");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("http://localhost:5000/api/auth/send-reset-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset link");
      }

      showPopup("✅ Password reset link sent to your email!");
    } catch (err) {
      console.error("Reset link error:", err);
      showPopup("❌ Failed to send reset link. Try again later.");
    } finally {
      setSaving(false);
    }
  };


  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-white text-sm">
        <Loader2 className="animate-spin mr-2" /> Loading profile...
      </div>
    );

  if (errorMessage)
    return (
      <div className="h-screen flex items-center justify-center text-red-400 text-sm">
        {errorMessage}
      </div>
    );

  if (!user)
    return (
      <div className="h-screen flex items-center justify-center text-gray-400 text-sm">
        No user data found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center py-12 relative overflow-hidden text-sm">
      {/* Floating Gradient Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-700/30 rounded-full blur-[140px] animate-pulse"></div>

      {/* Popup Message */}
      {popupMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div
            className={`flex flex-col items-center justify-center bg-gray-900/95 border rounded-2xl shadow-2xl px-10 py-8 w-[320px] transition-all
      ${popupMessage.startsWith("✅") ? "border-green-500/40" : "border-red-500/40"}`}
          >
            {/* Icon */}
            {popupMessage.startsWith("✅") ? (
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 animate-pulse">
                <CheckCircle size={50} className="text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 animate-pulse">
                <XCircle size={50} className="text-white" />
              </div>
            )}

            {/* Message */}
            <p className="text-center text-gray-200 text-sm font-medium">
              {popupMessage.replace("✅", "").replace("❌", "").trim()}
            </p>
          </div>
        </div>
      )}


      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 bg-gray-800/60 border border-gray-700 hover:bg-gray-700/70 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:shadow-md hover:shadow-blue-600/30"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* Banner Header */}
      <div className="w-full max-w-5xl bg-gradient-to-r from-blue-700/30 to-indigo-700/30 border border-blue-500/20 backdrop-blur-lg rounded-2xl p-5 mb-8 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Profile Dashboard
        </h1>
        <p className="text-center text-gray-400 mt-1 text-xs tracking-wide">
          Manage your identity and personal info
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row items-start gap-8 w-full max-w-5xl px-6 md:px-0">
        {/* LEFT - Summary */}
        <div className="flex flex-col items-center bg-gradient-to-b from-gray-900/70 to-gray-950/50 backdrop-blur-lg border border-blue-900/30 rounded-2xl shadow-xl p-6 w-full md:w-1/3 transition-all hover:shadow-blue-600/30">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-40 transition"></div>
            <img
              src={
                (isEditing ? tempUser.avatar : user.avatar) ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="relative w-32 h-32 rounded-full object-cover border-2 border-blue-500 shadow-lg"
            />
            {isEditing && (
              <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <h5 className="text-lg-400 font-semibold">{user.name}</h5>
          <p className="text-blue-400 mt-1 italic text-xs">
            {user.profession || "Profession not set"}
          </p>

          <div className="mt-3 text-gray-400 text-xs space-y-1">
            <p className="flex items-center gap-2">
              <Mail size={12} /> {user.email}
            </p>
            <p className="flex items-center gap-2">
              <Calendar size={12} /> Joined{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex justify-center items-center gap-4">
            {isEditing ? (
              <>
                {/* Cancel (left) */}
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center gap-1.5 transition text-xs"
                >
                  <X size={12} /> Cancel
                </button>

                {/* Save (right) */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md flex items-center gap-1.5 transition text-xs disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    <Save size={12} />
                  )}
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <>
                {/* Change Password (left) */}
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className={`flex items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md px-4 py-1.5 text-xs text-gray-300 transition-all ${saving ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {saving ? <Loader2 className="animate-spin" size={12} /> : <Lock size={12} />}
                  {saving ? "Sending..." : "Change Password"}
                </button>


                {/* Edit Profile (right) */}
                <button
                  onClick={handleEdit}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-md shadow-md shadow-blue-700/30 transition-all text-xs flex items-center gap-1.5"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>

        </div>

        {/* RIGHT - Details */}
        <div className="flex-1 bg-gradient-to-b from-gray-900/70 to-gray-950/50 backdrop-blur-lg border border-blue-900/30 rounded-2xl shadow-xl p-6 space-y-5 transition-all hover:shadow-indigo-600/30">
          <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">
            Personal Information
          </h3>

          {/* Full Name */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={tempUser.name || ""}
                onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })}
                className="w-full p-2.5 rounded-md bg-gray-800/70 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            ) : (
              <p className="p-2.5 bg-gray-800/70 rounded-md border border-gray-700 text-gray-200 text-sm">
                {user.name}
              </p>
            )}
          </div>

          {/* Profession */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Profession</label>
            {isEditing ? (
              <input
                type="text"
                value={tempUser.profession || ""}
                onChange={(e) =>
                  setTempUser({ ...tempUser, profession: e.target.value })
                }
                className="w-full p-2.5 rounded-md bg-gray-800/70 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            ) : (
              <p className="p-2.5 bg-gray-800/70 rounded-md border border-gray-700 text-gray-200 text-sm">
                {user.profession}
              </p>
            )}
          </div>

          {/* Email (Disabled when editing) */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Email</label>
            {isEditing ? (
              <input
                type="text"
                value={tempUser.email || user.email || ""}
                disabled
                className="w-full p-2.5 rounded-md bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed text-sm"
              />
            ) : (
              <p className="p-2.5 bg-gray-800/70 rounded-md border border-gray-700 text-gray-200 text-sm">
                {user.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

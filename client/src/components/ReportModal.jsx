import React, { useState } from "react";
import { X, Send } from "lucide-react";

export default function ReportModal({ message, onClose }) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const reasons = [
    "Inaccurate or misleading information",
    "Harmful or offensive content",
    "Spam or irrelevant response",
    "Privacy concern",
    "Other",
  ];

  const handleSubmit = () => {
    const finalReason = reason === "Other" ? customReason : reason;
    if (!finalReason.trim()) {
      setError(true);
      setTimeout(() => setError(false), 800); // Shake effect duration
      return;
    }

    console.log("📝 Reported message:", message);
    console.log("🚨 Reason:", finalReason);

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setReason("");
      setCustomReason("");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 p-6 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.08)] border border-gray-700 w-[420px] text-left animate-scaleIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors duration-200"
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-3 text-white text-center">
          Report Message
        </h2>

        {/* Instruction Text with Error Animation */}
        <p
          className={`text-sm mb-3 text-center transition-all duration-300 ${
            error
              ? "text-red-500 font-semibold animate-shake"
              : "text-gray-400"
          }`}
        >
          Please select a reason for reporting this message:
        </p>

        {/* Message preview */}
        <div className="text-gray-300 italic text-sm mb-5 max-h-24 overflow-y-auto border border-gray-700 bg-gray-900/60 p-3 rounded-lg">
          {message?.text || "No message content."}
        </div>

        {!submitted ? (
          <>
            {/* Radio options */}
            <div className="flex flex-col gap-3 mb-4">
              {reasons
                .filter((item) =>
                  reason === "Other" ? item === "Other" : true
                )
                .map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      reason === item
                        ? "bg-yellow-600/20 border border-yellow-600"
                        : "hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={item}
                      checked={reason === item}
                      onChange={() => setReason(item)}
                      className="accent-yellow-500 cursor-pointer"
                    />
                    <span className="text-gray-200 text-sm">{item}</span>
                  </label>
                ))}
            </div>

            {/* Custom reason textarea */}
            {reason === "Other" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please describe your reason..."
                rows={3}
                className="w-full bg-gray-900 text-gray-200 p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 outline-none resize-none mb-4 transition-all duration-200"
              />
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white flex items-center gap-1 transition-all duration-200 shadow-md hover:shadow-yellow-500/30"
              >
                <Send size={16} /> Submit
              </button>
            </div>
          </>
        ) : (
          <div className="text-green-400 font-medium animate-pulse text-center mt-2">
            ✅ Report submitted successfully!
          </div>
        )}
      </div>

      {/* Shake animation keyframes */}
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}

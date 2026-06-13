import React, { useState, useRef, useEffect } from "react";

export default function ChatInput({ onSend = () => { }, loading }) {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"
  );
  const textareaRef = useRef(null);

  const models = [
    { name: "Mistral", value: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai" },
    { name: "Gemma", value: "google/gemma-2-9b-it" },
    { name: "Llama", value: "meta-llama/Llama-3.1-8B-Instruct" },
    { name: "qwen", value: "Qwen/Qwen2.5-7B-Instruct" },
    { name: "Deepseek", value: "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"},
  ];

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [message]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    onSend(message, selectedModel);
    setMessage("");
  };

  const handleAudio = () => {
    alert("🎤 Voice input feature coming soon!");
  };

  return (
    <footer className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-4">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSend}
          className="flex flex-wrap md:flex-nowrap items-end space-y-2 md:space-y-0 md:space-x-2"
        >
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-gray-800 text-gray-200 border border-gray-700 rounded-lg p-2 focus:ring-blue-500 focus:outline-none w-full md:w-[110px] h-[50px]"
            //    ^--- smaller width, fits on mobile and desktop
            title="Select Model"
          >
            {models.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={loading ? "AI is thinking..." : "Type a message..."}
            rows="1"
            disabled={loading}
            className="flex-1 resize-none p-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 min-h-[50px] max-h-[180px] overflow-y-auto disabled:opacity-60"
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />

          <button
            type="button"
            onClick={handleAudio}
            disabled={loading}
            className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center transition-all duration-200"
            title="Voice Input"
          >
            <span role="img" aria-label="mic">
              🎤
            </span>
          </button>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${loading || !message.trim()
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            title="Send Message"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-2">&copy; {new Date().getFullYear()} yadam.ai All rights reserved.</p>
      </div>
    </footer>
  );
}

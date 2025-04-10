import React, { useState } from "react";
import axios from "axios";

export default function MessageInput({ conversationId, onMessageSent }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleSend = async () => {
    if (!text && !file) return;

    const formData = new FormData();
    formData.append("conversationId", conversationId);
    if (text) formData.append("caption", text);
    if (file) formData.append("file", file);

    try {
      const response = await axios.post("/api/messages/send-media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (onMessageSent) onMessageSent(response.data.message);
      setText("");
      setFile(null);
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 border-t p-4">
      <input
        type="file"
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-sm"
      />

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe un mensaje..."
        className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none"
      />

      <button
        onClick={handleSend}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Enviar
      </button>
    </div>
  );
}

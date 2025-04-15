import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { Paperclip, X, LayoutTemplate } from "lucide-react";
import MessageModalTemplate from "../components/MessageModalTemplate";

export default function MessageInput({ conversationId, onMessageSent }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [showPlantillaModal, setShowPlantillaModal] = useState(false);

  const handleSend = async () => {
    if (!text && !file) return;

    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append("conversationId", conversationId);
        if (text) formData.append("caption", text);
        formData.append("file", file);

        response = await axios.post("/messages/send-media", formData, {
          //headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axios.post("/messages/send", {
          conversationId,
          text,
        });
      }

      if (onMessageSent) onMessageSent(response.data.message);
      setText("");
      setFile(null);
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex flex-col p-4 border-t gap-2">
      {/* Preview del archivo seleccionado */}
      {file && (
        <div className="flex items-center justify-between bg-gray-100 border px-3 py-2 rounded text-sm">
          <span className="truncate">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Zona de entrada de mensaje */}
      <div className="flex items-center gap-2">

        {/* Botón plantilla */}
        <button
          onClick={() => setShowPlantillaModal(true)}
          className="text-gray-600 hover:text-indigo-600"
          title="Enviar mensaje estilo plantilla"
        >
          <LayoutTemplate className="w-5 h-5" />
        </button>

        {/* Botón subir archivo */}
        <label className="cursor-pointer text-gray-600 hover:text-indigo-600">
          <Paperclip className="w-5 h-5" />
          <input
            type="file"
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {/* Input texto */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none"
        />

        {/* Botón enviar (ya existe) */}
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Enviar
        </button>
      </div>

      {/* Modal de plantilla */}
      {showPlantillaModal && (
        <MessageModalTemplate
          conversationId={conversationId}
          onClose={() => setShowPlantillaModal(false)}
        />
      )}
    </div>
  );
}

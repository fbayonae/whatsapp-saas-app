import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { Paperclip, X, LayoutTemplate, MessageSquareText } from "lucide-react";
import MessageModalTemplate from "../components/MessageModalTemplate";
import MessageTemplateEditor from "../components/MessageTemplateEditor";


export default function MessageInput({ conversationId, onMessageSent }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [showPlantillaModal, setShowPlantillaModal] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [canSendRegularMessage, setCanSendRegularMessage] = useState(true);

  useEffect(() => {
    const checkConversationTime = async () => {
      try {
        const res = await axios.get(`/conversations/${conversationId}/check-window`);
        setCanSendRegularMessage(res.data.within24Hours);
      } catch (error) {
        console.error("❌ Error verificando ventana de 24h:", error);
        setCanSendRegularMessage(false); // fallback seguro
      }
    };

    if (conversationId) {
      checkConversationTime();
    }
  }, [conversationId]);

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
      {canSendRegularMessage ? (
        <div className="flex items-center gap-2">

          <button
            onClick={() => setShowTemplateEditor(true)}
            className="text-gray-600 hover:text-indigo-600"
            title="Editor avanzado de plantillas"
          >
            <MessageSquareText className="w-5 h-5" />
          </button>

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
      ) : (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded flex justify-between items-center">
          <p className="text-sm">Han pasado más de 24h desde el último mensaje. Solo puedes enviar una plantilla.</p>
          <button
            onClick={() => setShowTemplateEditor(true)}
            className="ml-4 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
          >
            Enviar plantilla
          </button>
        </div>
      )}

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

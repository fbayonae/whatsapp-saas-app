import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Chats() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios.get("/api/chats")
      .then(res => setConversations(res.data))
      .catch(err => console.error("❌ Error cargando conversaciones", err));
  }, []);

  const handleSelect = (conv) => {
    setSelectedConv(conv);
    axios.get(`/api/chats/${conv.id}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("❌ Error cargando mensajes", err));
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Panel izquierdo */}
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="text-lg font-semibold p-4 bg-indigo-600 text-white">Conversaciones</h2>
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => handleSelect(conv)}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${
              selectedConv?.id === conv.id ? "bg-indigo-100" : ""
            }`}
          >
            <div className="font-medium">{conv.contact?.name || "Sin nombre"}</div>
            <div className="text-sm text-gray-600">{conv.contact?.phoneNumber}</div>
            <div className="text-xs text-gray-400">{new Date(conv.lastMessageAt).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Panel derecho */}
      <div className="w-2/3 p-6 flex flex-col bg-gray-50">
        <h2 className="text-xl font-bold mb-4">
          {selectedConv ? `Chat con ${selectedConv.contact?.name || selectedConv.contact?.phoneNumber}` : "Selecciona una conversación"}
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 pr-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-white ${
                msg.direction === "INBOUND" ? "bg-gray-500 self-start" : "bg-indigo-600 self-end"
              }`}
            >
              <div className="text-sm">{msg.content}</div>
              <div className="text-xs text-right text-white/70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {messages.length === 0 && selectedConv && (
            <p className="text-gray-500">Esta conversación no tiene mensajes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

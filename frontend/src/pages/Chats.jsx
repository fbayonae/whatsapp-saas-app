import React, { useEffect, useState, useRef } from "react";
//import ImagePreview from "./components/utils/ImagePreview";
import MessageInput from "./components/messages/MessageInput";
import MessageBubble from "./components/messages/MessageBubble";
import axios from "./utils/axiosInstance";

export default function Chats() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    axios.get("/chats")
      .then(res => setConversations(res.data))
      .catch(err => console.error("❌ Error cargando conversaciones", err));
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedConv) return;
  
    // Cargar mensajes iniciales
    axios.get(`/chats/${selectedConv.id}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("❌ Error cargando mensajes", err));
  
    // ⏱️ Iniciar refresco periódico
    const interval = setInterval(() => {
      axios.get(`/chats/${selectedConv.id}/messages`)
        .then(res => setMessages(res.data))
        .catch(err => console.error("❌ Error refrescando mensajes", err));
    }, 5000); // cada 5 segundos
  
    return () => clearInterval(interval); // limpiar al cambiar de conversación
  }, [selectedConv]);
  

  const handleSelect = (conv) => {
    setSelectedConv(conv);
    axios.get(`/chats/${conv.id}/messages`)
      .then(res => setMessages(res.data))
      .catch(err => console.error("❌ Error cargando mensajes", err));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
  
    if (!newMessage.trim()) return;
  
    try {
      const res = await axios.post("/api/messages/send", {
        conversationId: selectedConv.id,
        text: newMessage.trim()
      });
  
      // Añadir el mensaje al estado actual
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("❌ Error al enviar mensaje:", err);
      alert("Error al enviar el mensaje");
    }
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
        <div className="flex-1 overflow-y-auto space-y-4 pr-4 bg-[#e5ddd5]">
        {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
        ))}
            <div ref={bottomRef} />
        </div>
        <div>
        <MessageInput
            conversationId={selectedConv?.id}
            onMessageSent={(msg) => {
                setMessages((prev) => [...prev, msg]);
            }}
        />
        </div>
      </div>
    </div>
  );
}

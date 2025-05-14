// NewChatModal.jsx
import React, { useState, useEffect } from "react";
import axios from "@utils/axiosInstance";

export default function NewChatModal({ onClose, onChatCreated, conversations }) {
    const [contacts, setContacts] = useState([]);
    const [selectedContactId, setSelectedContactId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        axios.get("/contacts")
            .then(res => setContacts(res.data || []))
            .catch(err => console.error("❌ Error obteniendo contactos:", err));
    }, []);

    const isPhoneValid = (phone) => {
        const pattern = /^\+?\d{9,15}$/;
        return pattern.test(phone);
    };

    const sanitizePhone = (input) => {
        return input.replace(/[^\d]/g, ""); // elimina todo excepto dígitos
      };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (selectedContactId) {
                const existing = conversations.find(c => c.contact?.id === parseInt(selectedContactId));
                if (existing) {
                    onChatCreated(existing);
                    onClose();
                    return;
                }
                const res = await axios.post("/chats", {
                    contactId: selectedContactId
                });
                onChatCreated(res.data);
                onClose();
            } else if (isPhoneValid(phoneNumber)) {
                const existingContact = contacts.find(c => c.phoneNumber === sanitizePhone(phoneNumber));
                if (existingContact) {
                    const existingConv = conversations.find(c => c.contact?.id === existingContact.id);
                    if (existingConv) {
                        alert("⚠️ Este número ya tiene una conversación activa.");
                        onChatCreated(existingConv);
                        onClose();
                        return;
                    }
                    // No hay conversación, crearla
                    const convRes = await axios.post("/chats/", {
                        contactId: existingContact.id
                    });
                    onChatCreated(convRes.data);
                    onClose();
                    return;
                }
                const contactRes = await axios.post("/contacts", {
                    phoneNumber: sanitizePhone(phoneNumber),
                    name: sanitizePhone(phoneNumber)
                });
                const convRes = await axios.post("/chats", {
                    contactId: selectedContactId
                });
                onChatCreated(convRes.data);
                onClose();
            } else {
                alert("Número de teléfono no válido");
            }
        } catch (err) {
            console.error("❌ Error creando conversación:", err);
            alert("Error al crear nueva conversación");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full space-y-4">
                <h2 className="text-xl font-bold">Nuevo Chat</h2>
                <div>
                    <label className="block mb-1 font-semibold">Seleccionar contacto</label>
                    <select
                        className="w-full border px-3 py-2 rounded"
                        value={selectedContactId}
                        onChange={e => {
                            setSelectedContactId(e.target.value);
                            setPhoneNumber("");
                        }}
                    >
                        <option value="">-- Ninguno --</option>
                        {contacts.map(contact => (
                            <option key={contact.id} value={contact.id}>
                                {contact.name} ({contact.phoneNumber})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block mb-1 font-semibold">O introducir número</label>
                    <input
                        type="tel"
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Ej. +34600111222"
                        value={phoneNumber}
                        onChange={e => {
                            setPhoneNumber(e.target.value);
                            setSelectedContactId("");
                        }}
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? "Creando..." : "Iniciar chat"}
                    </button>
                </div>
            </div>
        </div>
    );
}

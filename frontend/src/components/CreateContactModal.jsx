import React, { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";

export default function CreateContactModal({ onClose, contact = null, onSuccess }) {
    const [name, setName] = useState(contact?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(contact?.phoneNumber || "");
    const [error, setError] = useState("");

    useEffect(() => {
        if (contact) {
            setName(contact.name || "");
            setPhoneNumber(contact.phoneNumber || "");
        }
    }, [contact]);

    const handleSubmit = async () => {
        if (!name || !phoneNumber) {
            setError("Nombre y teléfono son obligatorios.");
            return;
        }

        try {
            if (contact?.id) {
                await axios.put(`/contacts/${contact.id}`, { name, phoneNumber });
            } else {
                await axios.post("/contacts", { name, phoneNumber });
            }

            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("❌ Error guardando contacto:", err);
            setError("Hubo un error al guardar el contacto.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
                <h3 className="text-lg font-semibold">
                    {contact ? "Editar contacto" : "Nuevo contacto"}
                </h3>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Número de teléfono</label>
                    <input
                        type="text"
                        className="w-full border rounded px-2 py-1"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

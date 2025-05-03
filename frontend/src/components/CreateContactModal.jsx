import React, { useState } from "react";
import axios from "../utils/axiosInstance";

export default function CreateContactModal({ onClose }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post("/contacts", { name, phoneNumber });
      onClose(); // cerrar modal
      window.location.reload(); // o actualizar la lista de contactos si usas estado
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear contacto");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">Nuevo contacto</h3>

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

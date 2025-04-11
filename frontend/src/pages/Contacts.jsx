import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/contacts")
      .then((res) => {
        setContacts(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Error al obtener contactos:", err);
      });
  }, []);

  const filteredContacts = contacts.filter((c) => {
    c.name.toLowerCase().includes(search.toLowerCase())
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contactos registrados</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <p>Cargando contactos...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">Creado el</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{contact.name}</td>
                  <td className="px-4 py-2">{contact.phoneNumber}</td>
                  <td className="px-4 py-2">
                    {new Date(contact.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No se encontraron contactos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

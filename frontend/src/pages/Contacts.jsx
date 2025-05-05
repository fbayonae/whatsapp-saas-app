import React, { useEffect, useState } from "react";
import axios from "@utils/axiosInstance";
import CreateContactModal from "@components/contacts/CreateContactModal";
import { Plus, Pencil } from "lucide-react";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await axios.get("/contacts");
      setContacts(res.data || []);
    } catch (err) {
      console.error("❌ Error al obtener contactos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contactos registrados</h1>

      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border px-3 py-2 rounded"
        />
        <button
          onClick={() => {
            setEditingContact(null);
            setShowModal(true);
          }}
          className="ml-4 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo contacto
        </button>
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
                <th className="px-4 py-2 text-left">Acciones</th>
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
                  <td className="px-4 py-2">
                    <button
                      onClick={() => {
                        setEditingContact(contact);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No se encontraron contactos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CreateContactModal
          onClose={() => setShowModal(false)}
          contact={editingContact}
          onSuccess={fetchContacts}
        />
      )}
    </div>
  );
}

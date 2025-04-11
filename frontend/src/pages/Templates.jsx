import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("/templates")
      .then(response => {
        setTemplates(response.data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar plantillas:", error);
        setLoading(false);
      });
  }, []);

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Plantillas de WhatsApp</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <p>Cargando plantillas...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse bg-white shadow rounded-lg">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Idioma</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Creado</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((template) => (
                <tr key={template.name} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{template.name}</td>
                  <td className="px-4 py-2">{template.language || "-"}</td>
                  <td className="px-4 py-2">{template.status || "-"}</td>
                  <td className="px-4 py-2">
                    {template.createdAt
                      ? new Date(template.createdAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
              {filteredTemplates.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                    No se encontraron plantillas.
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

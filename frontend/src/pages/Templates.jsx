import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { Pencil, Plus, CheckCircle, CircleX, Clock  } from "lucide-react";
import TemplateModalEditor from "../components/TemplateModalEditor";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false); // <- bandera de visibilidad

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("/templates");
      setTemplates(response.data);
    } catch (error) {
      console.error("❌ Error cargando plantillas:", error);
    }
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setShowModal(true); // mostrar modal para nueva
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setShowModal(true); // mostrar modal para editar
  };

  const handleCloseModal = () => {
    setSelectedTemplate(null);
    setShowModal(false);
    fetchTemplates(); // recargar
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar plantilla..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 border px-3 py-2 rounded"
        />
        <button
          onClick={handleNewTemplate}
          className="ml-4 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva plantilla
        </button>
      </div>

      <div className="space-y-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded p-4 flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{template.name}</h2>
              <p className="text-sm text-gray-600">
                {template.language} - {template.category}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Estado visual */}
              {template.status === "APPROVED" && (
                <div className="flex items-center gap-1 text-green-600 mr-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Aprobada</span>
                </div>
              )}
              {template.status === "REJECTED" && (
                <div className="flex items-center gap-1 text-red-500 mr-4">
                  <CircleX className="w-5 h-5" />
                  <span className="text-sm font-medium">Rechazada</span>
                </div>
              )}
              {template.status === "PENDING" && (
                <div className="flex items-center gap-1 text-orange-500 mr-4">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Pendiente</span>
                </div>
              )}
              <button
                onClick={() => handleEditTemplate(template)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <TemplateModalEditor
          template={selectedTemplate}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { Pencil, Plus } from "lucide-react";
import TemplateModalEditor from "../components/TemplateModalEditor";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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
  
  const handleCreateTemplate = async () => {
    try {
      const response = await axios.post("/templates/create", {
        name: "nueva_plantilla",
        language: "es",
        category: "UTILITY",
        components: []
      });
      setSelectedTemplate(response.data);
    } catch (error) {
      console.error("❌ Error creando plantilla:", error);
    }
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
          onClick={handleCreateTemplate}
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
              <p className="text-sm text-gray-600">{template.language} - {template.category}</p>
            </div>
            <button
              onClick={() => setSelectedTemplate(template)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <TemplateModalEditor
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onSave={() => {
            setSelectedTemplate(null);
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
}

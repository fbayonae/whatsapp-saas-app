import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

export default function MessageTemplateEditor({ conversationId, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get("/templates");
        setTemplates(res.data);
      } catch (err) {
        console.error("❌ Error cargando plantillas:", err);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const loadPayload = async () => {
      if (!selectedTemplate) return;
      try {
        const res = await axios.get(`/templates/${selectedTemplate.id_meta}/payload`, {
          params: { conversationId }
        });
        setParameters(res.data.parameters || []);
        generatePreview(res.data.parameters || []);
      } catch (err) {
        console.error("❌ Error cargando payload:", err);
      }
    };
    loadPayload();
  }, [selectedTemplate]);

  const handleParamChange = (sectionIndex, paramIndex, value) => {
    const newParams = [...parameters];
    if (newParams[sectionIndex]?.parameters[paramIndex]) {
      newParams[sectionIndex].parameters[paramIndex].text = value;
    }
    setParameters(newParams);
    generatePreview(newParams);
  };

  const generatePreview = (params) => {
    if (!selectedTemplate) return;
    const body = selectedTemplate.components.find(c => c.type === "BODY")?.text || "";

    const bodyParams = params.find(p => p.type === "body")?.parameters.map(p => p.text) || [];
    const parsedText = body.replace(/{{(\d+)}}/g, (_, index) => bodyParams[parseInt(index) - 1] || "");

    setPreview(parsedText);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-lg flex h-[80vh]">

        {/* Columna izquierda: listado de plantillas */}
        <div className="w-1/4 border-r overflow-y-auto p-4">
          <h2 className="font-bold mb-4">Plantillas</h2>
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl)}
              className={`cursor-pointer px-3 py-2 rounded hover:bg-indigo-100 ${
                selectedTemplate?.id === tpl.id ? "bg-indigo-200" : ""
              }`}
            >
              {tpl.name}
            </div>
          ))}
        </div>

        {/* Centro: parámetros */}
        <div className="w-2/4 p-6 overflow-y-auto">
          <h2 className="font-bold mb-4">Completar plantilla</h2>
          {parameters.length === 0 && (
            <p className="text-gray-500">Esta plantilla no requiere parámetros.</p>
          )}

          {parameters.map((section, sIndex) => (
            <div key={sIndex} className="mb-6">
              <h4 className="font-semibold capitalize mb-2">{section.type}</h4>
              {section.parameters.map((param, pIndex) => (
                <input
                  key={pIndex}
                  type="text"
                  value={param.text}
                  onChange={(e) => handleParamChange(sIndex, pIndex, e.target.value)}
                  className="mb-2 w-full px-4 py-2 border rounded shadow-sm"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Derecha: vista previa */}
        <div className="w-1/4 p-6 border-l overflow-y-auto">
          <h2 className="font-bold mb-4">Vista previa</h2>
          <div className="bg-gray-100 rounded p-4 text-sm whitespace-pre-line">
            {preview || "Selecciona una plantilla para ver la vista previa"}
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Cerrar
      </button>
    </div>
  );
}

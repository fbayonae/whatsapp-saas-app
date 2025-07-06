import React, { useEffect, useState } from "react";
import axios from "@api/core/axiosInstance.jsx";

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

    const isFormValid = parameters.every(section =>
        section.parameters.every(param => param.text && param.text.trim() !== "")
    );

    const handleSendTemplate = async () => {
        try {
            await axios.post("/messages/send-template", {
                conversationId,
                template: selectedTemplate.id_meta,
                language: selectedTemplate.language,
                parameters,
            });
            onClose();
        } catch (err) {
            console.error("❌ Error enviando plantilla:", err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-6xl rounded-lg shadow-lg flex flex-col h-[90vh]">

                <div className="flex flex-1">
                    {/* Columna izquierda: listado de plantillas */}
                    <div className="w-1/4 border-r overflow-y-auto p-4">
                        <h2 className="font-bold mb-4">Plantillas</h2>
                        {templates.map((tpl) => (
                            <div
                                key={tpl.id}
                                onClick={() => tpl.status === "APPROVED" && setSelectedTemplate(tpl)}
                                className={`cursor-pointer px-3 py-2 rounded mb-1
                ${tpl.status !== "APPROVED" ? "bg-red-100 text-red-500 cursor-not-allowed" : "hover:bg-indigo-100"}
                ${selectedTemplate?.id === tpl.id ? "bg-indigo-200" : ""}`}
                            >
                                {tpl.name} {tpl.status !== "APPROVED" && <span className="text-xs">(No aprobada)</span>}
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
                        <div className="bg-[#e5ddd5] rounded-lg p-4">
                            <div className="bg-white rounded-xl p-4 shadow-md relative">
                                {selectedTemplate?.components.find(c => c.type === "HEADER")?.text && (
                                    <div className="font-bold text-lg text-black mb-2">
                                        {selectedTemplate.components.find(c => c.type === "HEADER")?.text}
                                    </div>
                                )}
                                <div className="text-base text-black leading-snug">
                                    {preview || "Previsualización del cuerpo del mensaje"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones inferiores */}
                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={onClose}
                        className="mr-3 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={!isFormValid}
                        onClick={handleSendTemplate}
                        className={`px-4 py-2 rounded text-white ${isFormValid ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"
                            }`}
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
}

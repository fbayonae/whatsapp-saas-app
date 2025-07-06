// CampaignModal.jsx
import React, { useState, useEffect } from "react";
import axios from "@api/core/axiosInstance";
import { toast } from "react-toastify";

export default function CampaignModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [templates, setTemplates] = useState([]);
    const [campaignId, setCampaignId] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);

    useEffect(() => {
        axios.get("/templates")
            .then(res => setTemplates(res.data || []))
            .catch(() => toast.error("❌ Error cargando plantillas"))
            .finally(() => setLoadingTemplates(false));
    }, []);

    const handleCreateCampaign = async () => {
        if (!name.trim() || !templateId) {
            toast.error("Nombre y plantilla son obligatorios");
            return;
        }

        try {
            const res = await axios.post("/campaigns", { name: name.trim(), templateId: parseInt(templateId) });
            setCampaignId(res.data.id);
            setStep(2);
        } catch (err) {
            console.error("❌ Error creando campaña:", err);
            toast.error("Error al crear campaña");
        }
    };

    const handleLoadContacts = async () => {
        try {
            const res = await axios.get("/contacts");
            setContacts(res.data || []);
        } catch (err) {
            console.error("❌ Error obteniendo contactos:", err);
        }
    };

    useEffect(() => {
        if (step === 2) handleLoadContacts();
    }, [step]);

    const handleAssignContacts = async () => {
        if (!selectedContacts.length) {
            toast.error("Debes seleccionar al menos un contacto");
            return;
        }
        try {
            await axios.post(`/campaigns/${campaignId}/contacts`, {
                contactIds: selectedContacts
            });
            toast.success("✅ Contactos asignados a campaña");
            onSuccess();
            onClose();
        } catch (err) {
            console.error("❌ Error asignando contactos:", err);
            toast.error("Error al asignar contactos");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full space-y-4">
                <h2 className="text-xl font-bold">
                    {step === 1 ? "Crear nueva campaña" : "Asignar contactos"}
                </h2>

                {step === 1 && (
                    <>
                        <div>
                            <label className="block font-semibold mb-1">Nombre</label>
                            <input
                                type="text"
                                className="w-full border px-3 py-2 rounded"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Plantilla</label>
                            <select
                                className="w-full border px-3 py-2 rounded"
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                            >
                                <option value="">-- Selecciona una plantilla --</option>
                                {templates.map((tpl) => (
                                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className="text-gray-600">Selecciona los contactos que deseas incluir en esta campaña.</p>
                        <div className="max-h-60 overflow-y-auto border rounded">
                            {contacts.map((c) => (
                                <label key={c.id} className="block px-3 py-2 hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={selectedContacts.includes(c.id)}
                                        onChange={(e) => {
                                            setSelectedContacts((prev) =>
                                                e.target.checked
                                                    ? [...prev, c.id]
                                                    : prev.filter((id) => id !== c.id)
                                            );
                                        }}
                                    />
                                    {c.name} ({c.phoneNumber})
                                </label>
                            ))}
                        </div>
                    </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
                        Cancelar
                    </button>
                    {step === 1 && (
                        <button onClick={handleCreateCampaign} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded">
                            Siguiente
                        </button>
                    )}
                    {step === 2 && (
                        <button onClick={handleAssignContacts} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded">
                            Guardar campaña
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

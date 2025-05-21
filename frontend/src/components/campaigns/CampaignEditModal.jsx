// CampaignEditModal.jsx
import React, { useEffect, useState } from "react";
import axios from "@utils/axiosInstance";
import { Plus } from "lucide-react";

export default function CampaignEditModal({ campaignId, onClose }) {
    const [campaign, setCampaign] = useState(null);
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        axios.get(`/campaigns/${campaignId}`).then((res) => setCampaign(res.data));
    }, [campaignId]);

    const handleAddContacts = async () => {
        try {
            const res = await axios.get("/contacts");
            setContacts(res.data);
            // Aquí se podría abrir un submodal o expandir selección de contactos
        } catch (err) {
            console.error("❌ Error cargando contactos:", err);
        }
    };

    if (!campaign) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 space-y-8 overflow-y-auto max-h-[90vh]">

                {/* Datos de campaña */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Información de la campaña</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <div className="bg-gray-100 p-2 rounded">{campaign.name}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plantilla</label>
                            <div className="bg-gray-100 p-2 rounded">{campaign.template?.name}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <div className="bg-gray-100 p-2 rounded capitalize">{campaign.status}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha creación</label>
                            <div className="bg-gray-100 p-2 rounded">
                                {new Date(campaign.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview del mensaje */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Vista previa del mensaje</h3>
                    <div className="bg-[#e5ddd5] rounded p-4 text-sm text-gray-900 whitespace-pre-line">
                        {campaign.template?.components.find((c) => c.type === "BODY")?.text || "Sin contenido."}
                    </div>
                </div>

                {/* Contactos asignados */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Destinatarios</h3>
                        <button
                            className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                            onClick={handleAddContacts}
                        >
                            <Plus className="w-4 h-4 mr-1 inline-block" /> Añadir contactos
                        </button>
                    </div>
                    <div className="bg-white border rounded max-h-60 overflow-y-auto">
                        {campaign.contacts.length > 0 ? (
                            campaign.contacts.map((c) => (
                                <div key={c.id} className="flex justify-between px-4 py-2 border-b text-sm">
                                    <span>{c.contact?.name || c.contact?.phoneNumber}</span>
                                    <span className={`capitalize text-gray-600`}>{c.status}</span>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">No hay contactos asignados.</p>
                        )}
                    </div>
                </div>

                {/* Botón cerrar */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>


    );
}

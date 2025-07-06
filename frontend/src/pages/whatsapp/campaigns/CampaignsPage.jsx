// src/pages/Campaigns.jsx
import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import axios from "@api/core/axiosInstance.jsx";
import { toast } from "react-toastify";
import CampaignModal from "@components/modules/whatsapp/campaigns/CampaignModal";
import CampaignEditModal from "@components/modules/whatsapp/campaigns/CampaignEditModal";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editCampaignId, setEditCampaignId] = useState(null);

    const fetchCampaigns = async () => {
        try {
            const res = await axios.get("/campaigns");
            setCampaigns(res.data || []);
        } catch (err) {
            console.error("❌ Error al obtener campañas:", err);
        }
    };

    useEffect(() => {
        fetchCampaigns();

        const interval = setInterval(() => {
            fetchCampaigns(); // actualiza campañas cada 15 segundos
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("¿Deseas eliminar esta campaña?")) return;
        try {
            await axios.delete(`/campaigns/${id}`);
            toast.success("✅ Campaña eliminada");
            setCampaigns((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("❌ Error al eliminar campaña:", err);
            toast.error("❌ Error al eliminar campaña");
        }
    };

    const filteredCampaigns = campaigns.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Campañas</h1>
                <button
                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    onClick={() => setShowModal(true)}
                >

                    <Plus className="w-4 h-4 mr-2" /> Nueva campaña
                </button>
            </div>

            <input
                type="text"
                placeholder="Buscar campañas..."
                className="border px-3 py-2 rounded w-full md:w-1/3"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white border rounded">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Nombre</th>
                            <th className="px-4 py-2 text-left">Plantilla</th>
                            <th className="px-4 py-2 text-left">Estado</th>
                            <th className="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCampaigns.map((c) => (
                            <tr key={c.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{c.name}</td>
                                <td className="px-4 py-2">{c.template?.name || "-"}</td>
                                <td className="px-4 py-2 capitalize">{c.status}</td>
                                <td className="px-4 py-2 flex space-x-3">
                                    <button
                                        className="text-indigo-600 hover:text-indigo-800"
                                        onClick={() => setEditCampaignId(c.id)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => handleDelete(c.id)}
                                    >
                                        <Trash2 className="w-4 h-4 ml-3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredCampaigns.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">
                                    No se encontraron campañas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <CampaignModal
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchCampaigns}
                />
            )}

            {editCampaignId && (
                <CampaignEditModal
                    campaignId={editCampaignId}
                    onClose={() => {
                        setEditCampaignId(null);
                        fetchCampaigns();
                    }}
                />
            )}
        </div>
    );
}

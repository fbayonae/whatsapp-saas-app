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
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-5xl space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2 w-1/4">
            <h2 className="text-xl font-bold">{campaign.name}</h2>
            <p><strong>Plantilla:</strong> {campaign.template?.name}</p>
            <p><strong>Estado:</strong> {campaign.status}</p>
            <p><strong>Creada:</strong> {new Date(campaign.createdAt).toLocaleString()}</p>
          </div>

          <div className="w-1/2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Destinatarios</h3>
              <button
                onClick={handleAddContacts}
                className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" /> Añadir contactos
              </button>
            </div>
            <div className="border rounded max-h-60 overflow-y-auto">
              {campaign.contacts.map((c) => (
                <div key={c.id} className="px-4 py-2 border-b text-sm">
                  {c.contact.name} ({c.contact.phoneNumber}) - <span className="capitalize text-gray-600">{c.status}</span>
                </div>
              ))}
              {campaign.contacts.length === 0 && (
                <p className="p-4 text-sm text-gray-500">No hay contactos asignados.</p>
              )}
            </div>
          </div>

          <div className="w-1/4">
            <h3 className="text-lg font-semibold mb-2">Vista previa del mensaje</h3>
            <div className="text-sm bg-gray-100 p-3 rounded h-full overflow-auto">
              {(campaign.template?.components.find(c => c.type === "BODY")?.text || "")}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

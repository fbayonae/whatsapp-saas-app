import React, { useState, useEffect } from "react";
import axios from "@utils/axiosInstance.jsx";
import { toast } from "react-toastify";

export default function ConfigSettings() {
    const [preferences, setPreferences] = useState({
        filemakerHost: "",
        filemakerDatabase: "",
        filemakerUser: "",
        filemakerPassword: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        axios.get("/preferences")
            .then(res => {
                setPreferences(res.data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const handleChange = (e) => {
        setPreferences({ ...preferences, [e.target.name]: e.target.value });
    };

    const handleSaveFileMakerPreferences = async () => {
        try {
            const filemakerConfig = {
                filemakerHost: preferences.filemakerHost?.trim(),
                filemakerDatabase: preferences.filemakerDatabase?.trim(),
                filemakerUser: preferences.filemakerUser?.trim(),
                filemakerPass: preferences.filemakerPassword?.trim()
            };
            await axios.put("/preferences", filemakerConfig);
            toast.success("✅ Configuración de FileMaker guardada");
        } catch (error) {
            console.error("❌ Error guardando preferencias de FileMaker:", error);
            toast.error("❌ Error al guardar la configuración");
        }
    };

    const { filemakerHost, filemakerDatabase, filemakerUser, filemakerPass } = preferences || {};
    const canTestConnection = [filemakerHost, filemakerDatabase, filemakerUser, filemakerPass].every(
        v => typeof v === "string" && v.trim() !== ""
    );

    const testConnection = async () => {
        setIsTesting(true);
        try {
            await axios.post("/fm/loggin", preferences);
            alert("✅ Conexión exitosa con FileMaker");
        } catch (err) {
            alert("❌ Fallo en la conexión con FileMaker");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Configuración del sistema</h1>
            <div className="border rounded-lg shadow p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">FileMaker</h2>
                    <button
                        disabled={!canTestConnection || isTesting}
                        onClick={testConnection}
                        className={`px-4 py-2 rounded ${canTestConnection ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        {isTesting ? "Comprobando..." : "Test Conexión"}
                    </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" name="filemakerHost" placeholder="Host de FileMaker" className="border px-4 py-2 rounded" value={preferences.filemakerHost} onChange={handleChange} />
                    <input type="text" name="filemakerDatabase" placeholder="Nombre de la base de datos" className="border px-4 py-2 rounded" value={preferences.filemakerDatabase} onChange={handleChange} />
                    <input type="text" name="filemakerUser" placeholder="Usuario" className="border px-4 py-2 rounded" value={preferences.filemakerUser} onChange={handleChange} />
                    <input type="password" name="filemakerPassword" placeholder="Contraseña" className="border px-4 py-2 rounded" value={preferences.filemakerPassword} onChange={handleChange} />
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSaveFileMakerPreferences} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded transition">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

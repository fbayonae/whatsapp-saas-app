import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";

export default function ConfigLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get("/logs");
                setLogs(response.data || []);
            } catch (err) {
                console.error("❌ Error obteniendo logs:", err);
                setError("No se pudieron cargar los logs");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Logs del sistema</h2>
            {loading && <p className="text-gray-500">Cargando logs...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full table-auto text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Timestamp</th>
                                <th className="px-4 py-2 text-left">Nivel</th>
                                <th className="px-4 py-2 text-left">Mensaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-1 whitespace-nowrap">{log.timestamp}</td>
                                    <td className="px-4 py-1 capitalize text-xs font-semibold text-indigo-700">{log.level}</td>
                                    <td className="px-4 py-1 text-sm text-gray-800 break-words">{log.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
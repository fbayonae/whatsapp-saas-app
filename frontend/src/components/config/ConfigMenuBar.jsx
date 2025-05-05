import React from "react";

export default function ConfigMenuBar({ activeTab, setActiveTab }) {
    const tabs = [
        { key: "config", label: "Configuración" },
        { key: "users", label: "Usuarios" },
        { key: "logs", label: "Logs" }
    ];

    return (
        <div className="flex space-x-4 border-b pb-2 mb-4">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`px-4 py-2 rounded-t-md font-semibold ${activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    onClick={() => setActiveTab(tab.key)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
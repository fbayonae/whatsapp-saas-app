// SettingsPage.jsx
import React, { useState } from "react";
import axios from "@utils/axiosInstance.jsx";
import ConfigMenuBar from "@components/config/ConfigMenuBar.jsx";
import ConfigSettings from "@components/config/ConfigSettings.jsx";
import ConfigUsers from "@components/config/ConfigUsers.jsx";
import ConfigLogs from "@components/config/ConfigLogs.jsx";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("config");

    const renderActiveTab = () => {
        switch (activeTab) {
            case "config":
                return <ConfigSettings />;
            case "users":
                return <ConfigUsers />;
            case "logs":
                return <ConfigLogs />;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <ConfigMenuBar activeTab={activeTab} setActiveTab={setActiveTab} />
            {renderActiveTab()}
        </div>
    );
}

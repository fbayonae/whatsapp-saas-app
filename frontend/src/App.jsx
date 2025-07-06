import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLayout from "@components/layouts/SidebarLayout.jsx";
import Templates from "@pages/whatsapp/templates/TemplatesPage.jsx";
import Contacts from "@pages/whatsapp/contacts/ContactsPage.jsx";
import Chats from "@pages/whatsapp/chats/ChatsPage.jsx";
import Campaigns from "@pages/whatsapp/campaigns/CampaignsPage.jsx";
import Login from "@pages/auth/LoginPage.jsx";
import Config from "@pages/tenant/config/ConfigPage.jsx";
import PrivateRoute from "@routes/PrivateRoute.jsx";
import Welcome from "@pages/whatsapp/WelcomePage.jsx";

import AdminLoginPage from "@pages/admin/AdminLoginPage.jsx";
import AdminDashboard from "@pages/admin/AdminDashboard.jsx";
import AdminRoute from "@routes/AdminRoute.jsx"; // lo crearás ahora


export default function App() {
  return (
    <Routes>
      {/* Ruta pública para login */}
      <Route path="/login" element={<Login />} />

      {/* Ruta interna gestion tenants */}
      <Route path="/ges-inter-admin" element={<AdminLoginPage />} />

      {/* Ruta protegida para superadmin */}
      <Route
        path="/ges-inter-admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <SidebarLayout />
          </PrivateRoute>
        }
      >
        {/* Ruta de bienvenida por defecto */}
        <Route index element={<Welcome />} />

        {/* Rutas funcionales */}
        <Route path="plantillas" element={<Templates />} />
        <Route path="contactos" element={<Contacts />} />
        <Route path="chats" element={<Chats />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="configuracion" element={<Config />} />
      </Route>
    </Routes>
  );
}

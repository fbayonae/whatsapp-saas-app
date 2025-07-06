import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import SidebarLayout from "@components/layouts/SidebarLayout.jsx";
import AdminSidebarLayout from "@components/layouts/SidebarLayoutAdmin.jsx";

// Pages
import Templates from "@pages/whatsapp/templates/TemplatesPage.jsx";
import Contacts from "@pages/whatsapp/contacts/ContactsPage.jsx";
import Chats from "@pages/whatsapp/chats/ChatsPage.jsx";
import Campaigns from "@pages/whatsapp/campaigns/CampaignsPage.jsx";
import Login from "@pages/auth/LoginPage.jsx";
import Config from "@pages/tenant/config/ConfigPage.jsx";
import Welcome from "@pages/whatsapp/WelcomePage.jsx";

// Admin Pages and Routes
import AdminLoginPage from "@pages/admin/AdminLoginPage.jsx";
import AdminDashboard from "@pages/admin/AdminDashboard.jsx";
import TenantsPage from "@pages/admin/tenants/TenantsPage.jsx";
import UsersPage from "@pages/admin/users/UsersPage.jsx";

// Routes
import AdminRoute from "@routes/AdminRoute.jsx"; 
import PrivateRoute from "@routes/PrivateRoute.jsx";


export default function App() {
  return (
    <Routes>
      {/* Ruta pública para login */}
      <Route path="/login" element={<Login />} />

      {/* Ruta interna gestion tenants */}
      <Route path="/ges-inter-admin" element={<AdminLoginPage />} />

      {/* Ruta protegida para superadmin */}
      <Route
        path="/ges-inter-admin"
        element={
          <AdminRoute>
            <AdminSidebarLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="tenants" element={<TenantsPage />} />
        <Route path="usuarios" element={<UsersPage />} />
      </Route>

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

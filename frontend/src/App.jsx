import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/utils/SidebarLayout.jsx";
import Templates from "@pages/Templates.jsx";
import Contacts from "@pages/Contacts.jsx";
import Chats from "@pages/Chats.jsx";
import Login from "@pages/Login.jsx";
import Config from "@pages/Config.jsx";
import PrivateRoute from "@components/utils/PrivateRoute.jsx";
import Welcome from "@pages/Welcome.jsx";

export default function App() {
  return (
    <Routes>
      {/* Ruta pública para login */}
      <Route path="/login" element={<Login />} />

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
        <Route path="configuracion" element={<Config />} />
      </Route>
    </Routes>
  );
}

import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/utils/SidebarLayout";
import Templates from "./pages/Templates";
import Contacts from "./pages/Contacts";
import Chats from "./pages/Chats";
import Login from "./pages/Login";
import Config from "./pages/Config";
import PrivateRoute from "./components/utils/PrivateRoute";
import Welcome from "./pages/Welcome";

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

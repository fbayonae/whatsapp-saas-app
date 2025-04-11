import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout";
import Templates from "./pages/Templates";
import Contacts from "./pages/Contacts";
import Chats from "./pages/Chats";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <SidebarLayout />
          </PrivateRoute>
        }
      >
        <Route path="plantillas" element={<Templates />} />
        <Route path="contactos" element={<Contacts />} />
        <Route path="chats" element={<Chats />} />
      </Route>
    </Routes>
  );
}

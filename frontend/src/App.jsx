import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout";
import Templates from "./pages/Templates";
import Contacts from "./pages/Contacts";
import Chats from "./pages/Chats";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SidebarLayout />}>
        <Route path="plantillas" element={<Templates />} />
        <Route path="contactos" element={<Contacts />} />
        <Route path="chats" element={<Chats />} />
      </Route>
    </Routes>
  );
}

import React from "react";
import { Link, Outlet } from "react-router-dom";
import { LayoutDashboard, MessageCircle, Users, LogOut, Settings } from "lucide-react";

export default function SidebarLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-4 text-xl font-bold border-b border-gray-700">MyApp Logo</div>

          <nav className="flex flex-col p-4 space-y-4">
            <Link to="/plantillas" className="flex items-center space-x-2 hover:text-gray-300">
              <LayoutDashboard size={20} />
              <span>Plantillas</span>
            </Link>
            <Link to="/contactos" className="flex items-center space-x-2 hover:text-gray-300">
              <Users size={20} />
              <span>Contactos</span>
            </Link>
            <Link to="/chats" className="flex items-center space-x-2 hover:text-gray-300">
              <MessageCircle size={20} />
              <span>Chats</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 space-y-2 border-t border-gray-700">
          <button className="w-full flex items-center space-x-2 hover:text-gray-300">
            <Settings size={20} />
            <span>Configuración</span>
          </button>
          <button className="w-full flex items-center space-x-2 hover:text-gray-300">
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

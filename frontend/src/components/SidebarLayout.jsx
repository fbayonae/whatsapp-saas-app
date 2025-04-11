import React from "react";
import { LayoutDashboard, MessageCircle, Users, LogOut, Settings } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export default function SidebarLayout() {
    
    const navigate = useNavigate();

    const handleLogout = () => {
    // Eliminar tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken"); // si lo guardas

    // Redirigir a login
    navigate("/login");
    };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 text-2xl font-bold text-indigo-600 tracking-wide border-b border-gray-200">
            WhatsApp App
          </div>

          {/* Menu */}
          <nav className="flex flex-col p-4 space-y-4">
            <Link to="/plantillas" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
              <LayoutDashboard size={20} />
              <span className="ml-3">Plantillas</span>
            </Link>
            <Link to="/contactos" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
              <Users size={20} />
              <span className="ml-3">Contactos</span>
            </Link>
            <Link to="/chats" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">
              <MessageCircle size={20} />
              <span className="ml-3">Chats</span>
            </Link>
          </nav>
        </div>

        {/* Bottom buttons */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition">
            <Settings size={20} />
            <span className="ml-3">Configuración</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition">
            <LogOut size={20} />
            <span className="ml-3">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

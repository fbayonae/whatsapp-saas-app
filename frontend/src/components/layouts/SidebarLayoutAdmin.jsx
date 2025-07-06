import React from "react";
import { Users, Building, LogOut, Shield } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AdminSidebarLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-6 text-2xl font-bold text-indigo-700 tracking-wide border-b border-gray-200">
            Admin Panel
          </div>

          {/* Menu */}
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              to="/ges-inter-admin/tenants"
              className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <Building size={20} />
              <span className="ml-3">Tenants</span>
            </Link>
            <Link
              to="/ges-inter-admin/usuarios"
              className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <Users size={20} />
              <span className="ml-3">Usuarios</span>
            </Link>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
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

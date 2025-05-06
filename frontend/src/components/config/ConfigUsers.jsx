import React, { useEffect, useState, useCallback } from "react";
import axios from "@utils/axiosInstance";
import { Pencil, Plus, Trash2 } from "lucide-react";
import UserModal from "@components/config/UserModalEditor.jsx";
import { toast } from "react-toastify";

export default function ConfigUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const loadUsers = useCallback(() => {
        axios.get("/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error("❌ Error cargando usuarios:", err));
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.role.toLowerCase().includes(search.toLowerCase())
    );

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        loadUsers();
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
        try {
            await axios.delete(`/users/${userId}`);
            toast.success("✅ Usuario eliminado correctamente");
            loadUsers();
        } catch (error) {
            console.error("❌ Error eliminando usuario:", error);
            toast.error("❌ Error al eliminar el usuario");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Usuarios del sistema</h2>
                <button
                    className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => { setSelectedUser(null); setShowModal(true); }}
                >
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
                </button>
            </div>

            <input
                type="text"
                placeholder="Buscar por email, nombre o rol"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-1/3 border px-4 py-2 rounded mb-4"
            />

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Nombre</th>
                            <th className="px-4 py-2 text-left">Rol</th>
                            <th className="px-4 py-2 text-left">Fecha de creación</th>
                            <th className="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-t">
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2 capitalize">{user.role}</td>
                                <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString("es-ES")}</td>
                                <td className="px-4 py-2">
                                    <button
                                        className="text-indigo-600 hover:text-indigo-800"
                                        onClick={() => { setSelectedUser(user); setShowModal(true); }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <UserModal
                    user={selectedUser}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
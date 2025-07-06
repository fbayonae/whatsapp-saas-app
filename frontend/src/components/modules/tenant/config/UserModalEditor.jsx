import React, { useEffect, useState } from "react";
import axios from "@api/core/axiosInstance";
import { toast } from "react-toastify";

export default function UserModal({ user, onClose }) {
    const isEdit = Boolean(user);
    const [form, setForm] = useState({
        email: user?.email || "",
        name: user?.name || "",
        role: user?.role || "user",
        createdAt: user?.createdAt || new Date().toISOString(),
    });
    const [showPasswordInput, setShowPasswordInput] = useState(!isEdit);
    const [password, setPassword] = useState("");
    const [sessions, setSessions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (isEdit) {
            axios.get(`/users/${user.id}/sessions`)
                .then(res => setSessions(res.data))
                .catch(err => console.error("❌ Error cargando sesiones:", err));
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setHasChanges(true);
    };

    const handleSubmit = async () => {
        const { email, name, role } = form;

        if (!email || !name || !role || (!isEdit && !password)) {
            toast.error("❌ Todos los campos obligatorios deben estar completos");
            return;
        }

        if (!isEdit) {
            try {
                const check = await axios.get(`/users/check-email?email=${email}`);
                if (!check.data.available) {
                    toast.error("❌ El email ya está en uso");
                    return;
                }

                await axios.post("/users/register", {
                    email,
                    name,
                    role,
                    password
                });

                toast.success("✅ Usuario creado correctamente");
                onClose();
            } catch (err) {
                console.error("❌ Error creando usuario:", err);
                toast.error("❌ Error creando usuario");
            }
        } else {
            try {
                await axios.put(`/users/${user.id}`, {
                    name,
                    role,
                    password: showPasswordInput ? password : undefined
                });

                toast.success("✅ Usuario actualizado correctamente");
                onClose();
            } catch (err) {
                console.error("❌ Error actualizando usuario:", err);
                toast.error("❌ Error actualizando usuario");
            }
        }
    };

    const paginatedSessions = sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(sessions.length / itemsPerPage);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-3xl p-6 rounded shadow-lg overflow-y-auto max-h-screen">
                <h2 className="text-xl font-semibold mb-4">{isEdit ? "Editar Usuario" : "Nuevo Usuario"}</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    <input type="email" name="email" placeholder="Email" className="border px-4 py-2 rounded" value={form.email} onChange={handleChange} disabled={isEdit} />
                    <input type="text" name="name" placeholder="Nombre" className="border px-4 py-2 rounded" value={form.name} onChange={handleChange} />
                    <select name="role" className="border px-4 py-2 rounded" value={form.role} onChange={handleChange}>
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                    </select>
                    {isEdit && (
                        <input type="text" name="createdAt" className="border px-4 py-2 rounded" value={new Date(form.createdAt).toLocaleString("es-ES")} disabled />
                    )}

                    {showPasswordInput && (
                        <input type="password" name="password" placeholder="Contraseña" className="border px-4 py-2 rounded" value={password} onChange={e => { setPassword(e.target.value); setHasChanges(true); }} />
                    )}
                </div>

                {isEdit && (
                    <button
                        onClick={() => setShowPasswordInput(!showPasswordInput)}
                        className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                        {showPasswordInput ? "Ocultar cambio de contraseña" : "Cambiar contraseña"}
                    </button>
                )}

                {isEdit && (
                    <>
                        <h3 className="mt-6 text-lg font-semibold">Sesiones</h3>
                        <table className="w-full mt-2 table-auto border">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left">IP</th>
                                    <th className="px-4 py-2 text-left">User Agent</th>
                                    <th className="px-4 py-2 text-left">Creado</th>
                                    <th className="px-4 py-2 text-left">Expira</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSessions.map((s, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="px-4 py-2">{s.ip}</td>
                                        <td className="px-4 py-2 truncate max-w-xs">{s.userAgent}</td>
                                        <td className="px-4 py-2">{new Date(s.createdAt).toLocaleString("es-ES")}</td>
                                        <td className="px-4 py-2">{new Date(s.expiresAt).toLocaleString("es-ES")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex justify-end mt-4 space-x-2">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
                    {((!isEdit && form.email && form.name && form.role && password) || (isEdit && hasChanges)) && (
                        <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Guardar</button>
                    )}
                </div>
            </div>
        </div>
    );
}

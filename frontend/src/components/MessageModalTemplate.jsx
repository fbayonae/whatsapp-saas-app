import React, { useState } from "react";

export default function MensajePlantillaModal({ onClose, onSend }) {
    const [tipo, setTipo] = useState("CTA");
    const [header, setHeader] = useState("");
    const [body, setBody] = useState("");
    const [footer, setFooter] = useState("");

    const [ctaUrl, setCtaUrl] = useState("");
    const [ctaTexto, setCtaTexto] = useState("");

    const [replies, setReplies] = useState([{ id: "", title: "" }]);

    const handleReplyChange = (index, field, value) => {
        const updated = [...replies];
        updated[index][field] = value;
        setReplies(updated);
    };

    const addReply = () => {
        setReplies([...replies, { id: "", title: "" }]);
    };

    const handleSend = () => {
        const payload = {
            tipo,
            header,
            body,
            footer,
            ...(tipo === "CTA"
                ? { cta: { url: ctaUrl, display_text: ctaTexto } }
                : { replies })
        };
        onSend(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-5xl rounded-lg shadow-lg flex p-6 gap-6">
                {/* Izquierda */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="font-semibold">Tipo de mensaje:</label>
                        <select
                            className="ml-2 border rounded px-2 py-1"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        >
                            <option value="CTA">CTA</option>
                            <option value="REPLY">Reply</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold">Cabecera</label>
                        <input
                            type="text"
                            className="w-full border rounded px-2 py-1"
                            value={header}
                            onChange={(e) => setHeader(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Cuerpo</label>
                        <textarea
                            className="w-full border rounded px-2 py-1"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold">Pie</label>
                        <input
                            type="text"
                            className="w-full border rounded px-2 py-1"
                            value={footer}
                            onChange={(e) => setFooter(e.target.value)}
                        />
                    </div>

                    {tipo === "CTA" && (
                        <div className="space-y-2">
                            <label className="block font-semibold">Texto del botón</label>
                            <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={ctaTexto}
                                onChange={(e) => setCtaTexto(e.target.value)}
                            />
                            <label className="block font-semibold">URL</label>
                            <input
                                type="text"
                                className="w-full border rounded px-2 py-1"
                                value={ctaUrl}
                                onChange={(e) => setCtaUrl(e.target.value)}
                            />
                        </div>
                    )}

                    {tipo === "REPLY" && (
                        <div className="space-y-2">
                            <label className="block font-semibold">Botones de respuesta</label>
                            {replies.map((btn, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="ID"
                                        className="border rounded px-2 py-1 w-1/3"
                                        value={btn.id}
                                        onChange={(e) => handleReplyChange(idx, "id", e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Texto"
                                        className="border rounded px-2 py-1 w-2/3"
                                        value={btn.title}
                                        onChange={(e) => handleReplyChange(idx, "title", e.target.value)}
                                    />
                                </div>
                            ))}
                            <button onClick={addReply} className="text-blue-600 text-sm underline">
                                + Añadir opción
                            </button>
                        </div>
                    )}

                    <div className="flex gap-4 mt-4">
                        <button
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                            onClick={handleSend}
                        >
                            Enviar
                        </button>
                        <button
                            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* Derecha: Previsualización */}
                <div className="max-w-sm bg-white shadow rounded-xl p-4 space-y-2 border border-gray-200">
                    {/* Header */}
                    {header && (
                        <div className="font-bold text-base text-black">{header}</div>
                    )}

                    {/* Body */}
                    <div className="text-gray-900 text-sm">
                        {body}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className="text-gray-400 text-xs">{footer}</div>
                    )}

                    {/* Botón CTA */}
                    {ctaType === "cta" && (
                        <div className="pt-2">
                            <button className="w-full flex items-center justify-center gap-2 border border-green-500 text-green-600 text-sm py-2 px-4 rounded-lg hover:bg-green-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                {ctaText || "Visitar"}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

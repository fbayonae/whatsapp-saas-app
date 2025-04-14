import React, { useState } from "react";
import { SquareArrowUpRight, Undo, Plus, Trash2 } from "lucide-react";

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

    const removeReply = (index) => {
        const updated = replies.filter((_, i) => i !== index);
        setReplies(updated);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-5xl rounded-lg shadow-lg flex p-6 gap-6">
                {/* Izquierda */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold">Tipo de mensaje:</span>
                        <div className="flex items-center border rounded overflow-hidden">
                            <button
                                className={`px-4 py-1 ${tipo === "CTA" ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}
                                onClick={() => setTipo("CTA")}
                            >
                                CTA
                            </button>
                            <button
                                className={`px-4 py-1 ${tipo === "REPLY" ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}
                                onClick={() => setTipo("REPLY")}
                            >
                                Reply
                            </button>
                        </div>
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
                            <div className="flex items-center justify-between">
                                <label className="font-semibold">Botones de respuesta</label>
                                <button onClick={addReply} className="text-indigo-600 flex items-center gap-1 text-sm">
                                    <Plus className="w-4 h-4" /> Añadir
                                </button>
                            </div>
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
                                    <button onClick={() => removeReply(idx)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            
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

                <div className="bg-[#e5ddd5] rounded-lg p-6 w-[360px]">
                    <div className="bg-white rounded-xl p-4 shadow-md relative">
                        {/* Header */}
                        {header && (
                            <div className="font-bold text-lg text-black mb-2">{header}</div>
                        )}

                        {/* Body */}
                        <div className="text-base text-black leading-snug">
                            {body}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="text-sm text-gray-500 mt-3">{footer}</div>
                        )}
                        <hr></hr>
                        {tipo === "CTA" && (
                            <div className="pt-2">
                                <button className="w-full flex items-center justify-center gap-2 border border-white-500 text-green-600 text-sm py-2 px-4 rounded-lg hover:bg-green-50">
                                    <SquareArrowUpRight className="w-5 h-5" />
                                    {ctaTexto || "Visitar"}
                                </button>
                            </div>
                        )}

                        {tipo === "REPLY" && (
                            <div className="mt-4 space-y-1">
                                {replies.map((btn, i) => (
                                    <div>
                                        <button
                                            key={i}
                                            className="w-full flex items-center justify-center gap-2 border border-white-500 text-green-600 text-sm py-2 px-4 rounded-lg hover:bg-green-50"
                                        >
                                            <Undo className="w-5 h-5" />
                                            {btn.title || "Respuesta sin texto"}
                                        </button>
                                        <hr></hr>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

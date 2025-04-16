import React, { useState, useEffect } from "react";
import { SquareArrowUpRight, Plus, Trash2, Undo } from "lucide-react";

export default function TemplateEditorModal({ template, onClose, onSave }) {
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    if (template) {
      const bodyComponent = template.components.find(c => c.type === "BODY")?.text || "";
      const headerComponent = template.components.find(c => c.type === "HEADER")?.text || "";
      const footerComponent = template.components.find(c => c.type === "FOOTER")?.text || "";
      const replyButtons = template.components.find(c => c.type === "BUTTONS")?.buttons || [];

      setHeader(headerComponent);
      setBody(bodyComponent);
      setFooter(footerComponent);
      setReplies(replyButtons.map(btn => ({ text: btn.text })));
    }
  }, [template]);

  const handleReplyChange = (index, field, value) => {
    const updated = [...replies];
    updated[index][field] = value;
    setReplies(updated);
  };

  const addReply = () => setReplies([...replies, { text: "" }]);

  const removeReply = (index) => {
    const updated = replies.filter((_, i) => i !== index);
    setReplies(updated);
  };

  const handleSave = () => {
    const updatedTemplate = {
      ...template,
      components: [
        header && { type: "HEADER", format: "TEXT", text: header },
        { type: "BODY", text: body },
        footer && { type: "FOOTER", text: footer },
        replies.length > 0 && {
          type: "BUTTONS",
          buttons: replies.map(r => ({ type: "QUICK_REPLY", text: r.text }))
        }
      ].filter(Boolean)
    };
    onSave(updatedTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-5xl rounded-lg shadow-lg flex p-6 gap-6">
        {/* Izquierda */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block font-semibold mb-1">Cabecera</label>
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
                  placeholder="Texto"
                  className="w-full border rounded px-2 py-1"
                  value={btn.text}
                  onChange={(e) => handleReplyChange(idx, "text", e.target.value)}
                />
                <button onClick={() => removeReply(idx)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" onClick={handleSave}>Guardar</button>
            <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" onClick={onClose}>Cancelar</button>
          </div>
        </div>

        {/* Derecha: Previsualización */}
        <div className="bg-[#e5ddd5] rounded-lg p-6 w-[360px]">
          <div className="bg-white rounded-xl p-4 shadow-md relative">
            {header && (
              <div className="font-bold text-lg text-black mb-2">{header}</div>
            )}

            <div className="text-base text-black leading-snug">
              {body}
            </div>

            {footer && (
              <div className="text-sm text-gray-500 mt-3">{footer}</div>
            )}

            {replies.length > 0 && (
              <div className="mt-4 space-y-1">
                {replies.map((btn, i) => (
                  <button
                    key={i}
                    className="w-full bg-gray-200 px-3 py-2 rounded text-left hover:bg-gray-300"
                  >
                    {btn.text || "Respuesta sin texto"}
                  </button>
                ))}
              </div>
            )}

            <div className="absolute bottom-2 right-3 text-xs text-gray-400">12:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}

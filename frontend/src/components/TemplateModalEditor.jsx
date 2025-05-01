import React, { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import { SquareArrowUpRight, Plus, Trash2 } from "lucide-react";

export default function TemplateEditorModal({ template, onClose }) {
  const [header, setHeader] = useState("");
  const [headerExample, setHeaderExample] = useState("");
  const [headerType, setHeaderType] = useState("text");
  const [headerFile, setHeaderFile] = useState(null);
  const [body, setBody] = useState("");
  const [bodyExamples, setBodyExamples] = useState([]);
  const [footer, setFooter] = useState("");
  const [footerExample, setFooterExample] = useState("");
  const [category, setCategory] = useState("UTILITY");
  const [replies, setReplies] = useState([]);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (template) {
      const bodyComponent = template.components?.find(c => c.type === "BODY") || {};
      const headerComponent = template.components?.find(c => c.type === "HEADER") || null;
      const footerComponent = template.components?.find(c => c.type === "FOOTER") || {};
      const replyButtons = template.components?.find(c => c.type === "BUTTONS")?.buttons || [];

      if (headerComponent) {
        setHeaderType(headerComponent.format?.toLowerCase() || "text");
        if (headerComponent.format === "TEXT") {
          setHeader(headerComponent.text || "");
          setHeaderExample(headerComponent.example?.header_text?.[0] || "");
        }
      }

      setBody(bodyComponent.text || "");
      setBodyExamples(bodyComponent.example?.body_text || []);
      setFooter(footerComponent.text || "");
      setFooterExample(footerComponent.example?.footer_text || "");
      setReplies(replyButtons.map(btn => ({ text: btn.text })));
      setCategory(template.category || "UTILITY");
    }
  }, [template]);

  const markModified = () => setIsModified(true);

  const handleReplyChange = (index, field, value) => {
    const updated = [...replies];
    updated[index][field] = value;
    setReplies(updated);
    markModified();
  };

  const addReply = () => {
    setReplies([...replies, { text: "" }]);
    markModified();
  };

  const removeReply = (index) => {
    const updated = replies.filter((_, i) => i !== index);
    setReplies(updated);
    markModified();
  };

  const handleValidate = async () => {
    const components = [
      headerType !== "none" && {
        type: "HEADER",
        format: headerType.toUpperCase(),
        ...(headerType === "text" ? { text: header } : {}),
        ...(header && header.includes("{{") && headerExample ? { example: { header_text: [headerExample] } } : {})
      },
      {
        type: "BODY",
        text: body,
        ...(body.includes("{{") && bodyExamples.length > 0 ? { example: { body_text: bodyExamples } } : {})
      },
      footer && {
        type: "FOOTER",
        text: footer,
        ...(footer.includes("{{") && footerExample ? { example: { footer_text: footerExample } } : {})
      },
      replies.length > 0 && {
        type: "BUTTONS",
        buttons: replies.map(r => ({ type: "QUICK_REPLY", text: r.text }))
      }
    ].filter(Boolean);

    const payload = {
      name: template?.name || undefined,
      language: template?.language || "es",
      category,
      components
    };

    try {
      if (template?.id_meta) {
        await axios.put(`/templates/update/${template.id_meta}`, payload);
      } else {
        await axios.post("/templates/create", payload);
      }
      setIsModified(false);
    } catch (error) {
      console.error("❌ Error al validar plantilla:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-5xl rounded-lg shadow-lg flex p-6 gap-6">
        {/* Izquierda */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Categoría:</span>
            <div className="flex gap-2">
              {["UTILITY", "AUTHENTICATION", "MARKETING"].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    markModified();
                  }}
                  className={`px-3 py-1 rounded-full border ${category === cat ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}
                >
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Tipo de Cabecera</label>
            <select
              className="w-full border rounded px-2 py-1 mb-2"
              value={headerType}
              onChange={(e) => {
                setHeaderType(e.target.value);
                setHeader("");
                setHeaderExample("");
                setHeaderFile(null);
                markModified();
              }}
            >
              <option value="text">Texto</option>
              <option value="image">Imagen</option>
              <option value="document">Documento</option>
            </select>
            {headerType === "text" ? (
              <>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 mb-1"
                  value={header}
                  onChange={(e) => { setHeader(e.target.value); markModified(); }}
                />
                {header.includes("{{") && (
                  <input
                    type="text"
                    className="w-full border rounded px-2 py-1"
                    placeholder="Ejemplo de header"
                    value={headerExample}
                    onChange={(e) => { setHeaderExample(e.target.value); markModified(); }}
                  />
                )}
              </>
            ) : (
              <input
                type="file"
                className="w-full border rounded px-2 py-1"
                accept={headerType === "image" ? "image/*" : "application/*"}
                onChange={(e) => { setHeaderFile(e.target.files[0]); markModified(); }}
              />
            )}
          </div>

          <div>
            <label className="block font-semibold">Cuerpo</label>
            <textarea
              className="w-full border rounded px-2 py-1 mb-1"
              value={body}
              onChange={(e) => { setBody(e.target.value); markModified(); }}
            />
            {body.includes("{{") && (
              <>
                {Array.from(body.matchAll(/{{\d+}}/g)).map((match, index) => (
                  <input
                    key={index}
                    type="text"
                    className="w-full border rounded px-2 py-1 mb-1"
                    placeholder={`Ejemplo para ${match[0]}`}
                    value={bodyExamples[index] || ""}
                    onChange={(e) => {
                      const updated = [...bodyExamples];
                      updated[index] = e.target.value;
                      setBodyExamples(updated);
                      markModified();
                    }}
                  />
                ))}
              </>
            )}
          </div>

          <div>
            <label className="block font-semibold">Pie</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-1"
              value={footer}
              onChange={(e) => { setFooter(e.target.value); markModified(); }}
            />
            {footer.includes("{{") && (
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                placeholder="Ejemplo de footer"
                value={footerExample}
                onChange={(e) => { setFooterExample(e.target.value); markModified(); }}
              />
            )}
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
            {isModified && (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                onClick={handleValidate}
              >
                <SquareArrowUpRight className="w-5 h-5" /> Validar
              </button>
            )}
            <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" onClick={onClose}>Cancelar</button>
          </div>
        </div>

        {/* Derecha: Previsualización */}
        <div className="bg-[#e5ddd5] rounded-lg p-6 w-[360px]">
          <div className="bg-white rounded-xl p-4 shadow-md relative">
            {headerType === "text" && header && (
              <div className="font-bold text-lg text-black mb-2">{header}</div>
            )}
            {headerType === "image" && headerFile && (
              <div className="mb-2">
                <img
                  src={URL.createObjectURL(headerFile)}
                  alt="preview"
                  className="max-w-full max-h-40 rounded shadow"
                />
              </div>
            )}
            {headerType !== "text" && headerFile && headerType !== "image" && (
              <div className="mb-2">
                <div className="text-sm text-gray-500">Adjunto: {headerFile.name}</div>
              </div>
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

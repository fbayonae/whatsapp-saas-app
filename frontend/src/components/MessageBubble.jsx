import React from "react";
import ImagePreview from "./ImagePreview";
import { FileText, Music, File, SquareArrowUpRight, Undo } from "lucide-react";

export default function MessageBubble({ message, allMessages = [] }) {
  const isInbound = message.direction === "INBOUND";
  const alignment = isInbound ? "justify-start" : "justify-end";
  const bubbleColor = isInbound ? "bg-white text-black" : "bg-[#dcf8c6] text-black";

  const mediaUrl = message.media_id ? `/api/media/${message.media_id}` : null;
  const isImage = message.type === "image";
  const isAudio = message.type === "audio";
  const isVideo = message.type === "video";
  const isDocument = message.type === "document";
  const isCTA = message.type === "cta";
  const isReply = message.type === "reply";

  const contextMessage = message.contextId
    ? allMessages.find((m) => m.id_meta === message.contextId)
    : null;

  return (
    <div className={`w-full flex ${alignment} mb-2`}>
      <div className={`w-[300px] p-3 rounded-xl shadow ${bubbleColor}`}>

        {/* Contexto del mensaje */}
        {contextMessage && (
          <div className="border-l-4 border-green-600 pl-2 mb-2 text-sm text-gray-700 bg-gray-100 rounded">
            {contextMessage.type === "image" && contextMessage.media_id && (
              <div className="mb-1">
                <img
                  src={`/api/media/${contextMessage.media_id}`}
                  alt="context"
                  className="max-w-full max-h-20 rounded"
                />
              </div>
            )}
            <div>
              {contextMessage.content || "(mensaje sin texto)"}
            </div>
          </div>
        )}

        {/* Imagen */}
        {isImage && mediaUrl && (
          <div className="mb-2">
            <ImagePreview message={message} />
          </div>
        )}

        {/* Video */}
        {isVideo && mediaUrl && (
          <div className="mb-2">
            <video controls className="w-full rounded">
              <source src={mediaUrl} type={message.media_mimeType} />
              Tu navegador no soporta video.
            </video>
          </div>
        )}

        {/* Audio */}
        {isAudio && mediaUrl && (
          <div className="flex items-center gap-2 mt-2">
            <Music className="w-5 h-5 text-black" />
            <audio controls className="w-full">
              <source src={mediaUrl} type={message.media_mimeType} />
              Tu navegador no soporta audio.
            </audio>
          </div>
        )}

        {/* Documento */}
        {isDocument && mediaUrl && (
          <div className="mt-2 bg-gray-100 text-black p-3 rounded flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all text-sm"
            >
              Ver documento
            </a>
          </div>
        )}

        {/* CTA */}
        {isCTA && (
          <div className="bg-white text-black rounded-lg p-3 shadow">
            {message.header && <div className="font-bold text-lg mb-1">{message.header}</div>}
            <div className="text-sm">{message.content}</div>
            {message.footer && <div className="text-xs text-gray-600 mt-2">{message.footer}</div>}
            <hr className="my-2" />
            <div className="pt-1">
              <a
                href={message.action?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 text-green-600 text-sm py-1 px-3 rounded-lg hover:bg-green-50 border border-green-600"
              >
                <SquareArrowUpRight className="w-4 h-4" />
                {message.action?.display_text || "Ver"}
              </a>
            </div>
          </div>
        )}

        {/* Reply */}
        {isReply && (
          <div className="bg-white text-black rounded-lg p-3 shadow">
            {message.header_type === "text" && message.header && (
              <div className="font-bold text-lg mb-1">{message.header}</div>
            )}

            {message.header_type !== "text" && mediaUrl && (
              <div className="mb-2">
                <ImagePreview message={message} />
              </div>
            )}

            <div className="text-sm">{message.content}</div>
            {message.footer && <div className="text-xs text-gray-600 mt-2">{message.footer}</div>}
            <hr className="my-2" />
            <div className="space-y-1">
              {Array.isArray(message.action) && message.action.map((btn, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center justify-center gap-2 text-green-600 text-sm py-1 px-3 rounded-lg hover:bg-green-50 border"
                >
                  <Undo className="w-4 h-4" />
                  {btn.reply?.title || "Respuesta"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Texto común */}
        {message.type === "text" && message.content && (
          <div className={`text-sm mt-2`}>{message.content}</div>
        )}

        {/* Hora */}
        <div className="text-xs text-gray-400 mt-2 text-right">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

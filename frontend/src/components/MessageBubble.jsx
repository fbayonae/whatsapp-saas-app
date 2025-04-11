import React, { useState } from "react";
import ImagePreview from "./ImagePreview";
import { FileText, Music, File } from "lucide-react";

export default function MessageBubble({ message }) {
  const isInbound = message.direction === "INBOUND";
  const alignment = isInbound
    ? "self-start text-left bg-gray-500"
    : "self-end text-right bg-indigo-600";

  const isImage = message.media_mimeType?.startsWith("image/");
  const isAudio = message.media_mimeType?.startsWith("audio/");
  const isDocument = message.media_mimeType && !isImage && !isAudio;

  const mediaUrl = message.media_id ? `/api/media/${message.media_id}` : null;

  return (
    <div
      className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-white ${alignment}`}
    >
      {/* Imagen */}
      {isImage && <ImagePreview message={message} />}

      {/* Audio */}
      {isAudio && mediaUrl && (
        <div className="flex items-center gap-2 mt-2">
            <Music className="w-5 h-5 text-white" />
            <audio controls className="w-full">
            <source src={mediaUrl} type={message.media_mimeType} />
            Tu navegador no soporta audio.
            </audio>
        </div>
    )}


      {/* Documento */}
      {isDocument && mediaUrl && (
        <div className="mt-2 bg-white text-black p-3 rounded flex items-center gap-2">
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


      {/* Texto si existe */}
      {message.content && (
        <div className={`text-sm mt-2`}>
          {message.content}
        </div>
      )}

      {/* Hora */}
      <div className="text-xs text-white/70 mt-2 text-right">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

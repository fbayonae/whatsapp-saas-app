// src/components/ImagePreview.jsx
import React, { useState } from "react";
import { Image } from "lucide-react";

export default function ImagePreview({ message }) {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(false);

  const imageUrl = `/api/media/${message.media_id}`;

  const handleError = () => setError(true);

  return (
    <>
      {error ? (
        <div className="flex items-center gap-2 text-white text-sm">
          <Image className="w-5 h-5" />
          <span>Imagen no disponible</span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="imagen recibida"
          className="w-32 h-32 object-cover rounded cursor-pointer"
          onClick={() => setShowModal(true)}
          onError={handleError}
        />
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <img
            src={imageUrl}
            alt="vista ampliada"
            className="max-w-[90%] max-h-[90%] rounded-lg"
          />
        </div>
      )}
    </>
  );
}

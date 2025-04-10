import React, { useState } from "react";
import { Image } from "lucide-react";

export default function ImagePreview({ message }) {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(false);

  const imageUrl = `/api/media/${message.mediaId}`; // crea este endpoint si no existe aún

  const handleError = () => setError(true);

  return (
    <>
      {error ? (
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <Image className="w-5 h-5" />
          <span>Imagen no disponible</span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="imagen"
          className="w-32 h-32 object-cover rounded cursor-pointer"
          onClick={() => setShowModal(true)}
          onError={handleError}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <img
            src={imageUrl}
            alt="imagen completa"
            className="max-w-full max-h-full rounded-lg"
            onClick={() => setShowModal(false)}
          />
        </div>
      )}
    </>
  );
}

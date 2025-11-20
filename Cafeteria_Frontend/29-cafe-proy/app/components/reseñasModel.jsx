'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ReseñaModal({ 
  productId, 
  isOpen, 
  onClose, 
  onSubmit 
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const enviarReseña = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/Reseñas`, {
        productoId: productId,
        comentario: comment,
        puntuacion: rating
      });

      toast.success('Reseña enviada correctamente');

      // Limpia valores y cierra modal
      setComment('');
      setRating(0);

      if (onSubmit) onSubmit();
      onClose();

    } catch (err) {
      console.error(err);
      toast.error('Error al enviar reseña');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">


        <div className="bg-[#48150A] p-6 rounded-lg w-96"> 

        <h2 className="text-xl text-center font-bold mb-4"> AGREGAR RESEÑA </h2>

        <label className="block mb-2 font-semibold">Comentario:</label>
        <textarea
          className="w-full border rounded p-2 mb-4 focus:ring-0 focus:border-red-500"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <label className="block mb-2 font-semibold">Puntuación:</label>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-black-300'}`}
            >
              ⭐
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-800"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-red-700"
            onClick={enviarReseña}
          >
            Enviar
          </button>
        </div>

      </div>



    </div>
  );
}

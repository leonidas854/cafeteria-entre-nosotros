'use client';

import { useState } from 'react';
import { apiClient as axios } from '@/src/shared/api/apiClient';
import toast from 'react-hot-toast';
import { request } from 'http';
const PYTHON_API_URL = process.env.PYTHON_API_URL_; 


const StarIcon = ({ filled, onClick }) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"} // Relleno si está activa
      stroke="currentColor" 
      strokeWidth={2}
      className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
        filled ? 'text-yellow-400' : 'text-gray-400'
      }`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
};

export default function ReseñaModal({ 
  productId, 
  isOpen, 
  onClose, 
  onSubmit 
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false); 
  if (!isOpen) return null;

  const enviarReseña = async () => {
    if (rating === 0) {
      toast.error('Por favor selecciona una puntuación');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/Resena`, {
        comentario: comment,
        puntuacion: rating,
        producto_id: productId,
      },{
        withCredentials: true,
      });

      toast.success('Reseña enviada correctamente');
      setComment('');
      setRating(0);


      try {
        await axios.post(`${PYTHON_API_URL}/entrenar`);
        console.log("Modelo IA re-entrenado con éxito.");
        
        window.dispatchEvent(new Event('modeloActualizado'));
        
      } catch (aiError) {
        console.warn("La reseña se guardó, pero la IA no respondió:", aiError);
      }

      setComment('');
      setRating(0);

      if (onSubmit) onSubmit();
      onClose();
      

    } catch (err) {
      if (err.response?.status === 401) {
      toast.error('Haga login');
    } else {
      toast.error('Error');
    }
    }
    
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#48150A] p-6 rounded-lg w-96 text-white"> 

        <h2 className="text-xl text-center font-bold mb-4">AGREGAR RESEÑA</h2>

        <label className="block mb-2 font-semibold">Comentario:</label>
        <textarea
          className="w-full border rounded p-2 mb-4 text-white focus:ring-0 focus:border-red-500"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <label className="block mb-2 font-semibold">Puntuación:</label>
        <div className="flex gap-2 mb-4 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon 
              key={star} 
              filled={star <= rating} 
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
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
'use client';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

// URL de tu API Python
const PYTHON_API_URL = "http://localhost:8000"; 

export default function RecomendadosCarousel({ onSelectProduct }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainer = useRef(null);
  const IMAGE_BASE_URL = "http://localhost:5054";


  const fetchRecomendaciones = async () => {
    try {
      setLoading(true);
      // Petición a FastAPI
      const res = await axios.get(`${PYTHON_API_URL}/recomendaciones`);
      if (res.data && res.data.productos) {
        setProductos(res.data.productos);
      }
    } catch (error) {
      console.error("Error cargando recomendaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecomendaciones();

    // Escuchar el evento que lanzamos desde el Modal de Reseña
    const handleUpdate = () => fetchRecomendaciones();
    window.addEventListener('modeloActualizado', handleUpdate);
    
    return () => window.removeEventListener('modeloActualizado', handleUpdate);
  }, []);

  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = 300;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return null; // O un spinner pequeño
  if (productos.length === 0) return null;

  return (
    <div className="w-full bg-[#48150A]/5 p-6 rounded-xl mb-8 border border-[#48150A]/10">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h2 className="text-2xl font-bold text-[#48150A]">🌟 Recomendados para Hoy</h2>
            <p className="text-sm text-gray-600">Basado en las reseñas de nuestros clientes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white shadow hover:bg-gray-100 text-[#48150A]">⬅️</button>
          <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white shadow hover:bg-gray-100 text-[#48150A]">➡️</button>
        </div>
      </div>

      <div 
        ref={scrollContainer}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none' }}
      >
        {productos.map((prod) => (
          <div 
            key={prod.id_producto}
            onClick={() => onSelectProduct && onSelectProduct(prod)}
            className="min-w-[240px] bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer snap-start border border-gray-100"
          >
            <div className="h-36 w-full relative bg-gray-200">
              <img 
  src={`${IMAGE_BASE_URL}${prod.imagen}`} 
  alt={prod.nombre}
  className="w-full h-full object-cover"
/>
              <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full shadow">
                ★ {prod.score_ia}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-[#48150A] truncate">{prod.nombre}</h3>
              <p className="text-xs text-gray-500 mb-2">{prod.categoria}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">Bs. {prod.precio}</span>
                <span className="text-xs bg-[#48150A] text-white px-2 py-1 rounded">Ver</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
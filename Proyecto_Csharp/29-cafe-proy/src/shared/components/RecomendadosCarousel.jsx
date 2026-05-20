'use client';
import { useEffect, useState, useRef } from 'react';
import { apiClient as axios } from '@/src/shared/api/apiClient';
import { agregarProductoAlCarrito } from '@/src/features/menu/api/Carrito';
import {getProductoPorId} from '@/src/features/menu/api/productos';
import toast, { Toaster } from 'react-hot-toast';
// URL de tu API Python
const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL_; 

export default function RecomendadosCarousel({ onSelectProduct ,onCarritoUpdated}) {
  const [productos, setProductos] = useState([]);
   const [addingId, setAddingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollContainer = useRef(null);
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;


  const fetchRecomendaciones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(PYTHON_API_URL);
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
    const handleUpdate = () => fetchRecomendaciones();
    window.addEventListener('modeloActualizado', handleUpdate);
    
    return () => window.removeEventListener('modeloActualizado', handleUpdate);
  }, []);


  const handleAddToCart = async (e, prod) => {
    e.stopPropagation(); 
    setAddingId(prod.id_producto); 

    try {
      const productoCompleto = await getProductoPorId(prod.id_producto);

      if (!productoCompleto) {
        throw new Error("No se encontró la información completa del producto");
      }
      await agregarProductoAlCarrito(
        productoCompleto.id,         
        productoCompleto.nombre,     
        productoCompleto.categoria,  
        productoCompleto.precio,     
        1,                          
        []                          
      );
      
      
 if (onCarritoUpdated) {
        await onCarritoUpdated(); 
      }
   // toast.success('✅ Producto añadido al carrito');
     //await cargarCarrito();

    } catch (error) {
      
      if (error?.response?.status === 401) {
        toast.error('⚠️ Debes iniciar sesión para comprar');
      } else {
        toast.error('❌ Error al añadir al carrito');
      }
    } finally {
      setAddingId(null);
    }
  };

  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = 300;
      scrollContainer.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return null; 
  if (productos.length === 0) return null;

  return (
    <div className="w-full bg-[#48150A]/5 p-6 rounded-xl mb-8 border border-[#48150A]/10">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h2 className="text-2xl font-bold text-[#de6449]">🌟 Recomendados para Hoy</h2>
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
                <button 
                  onClick={(e) => handleAddToCart(e, prod)}
                  disabled={addingId === prod.id_producto}
                  className={`text-xs px-3 py-1.5 rounded font-medium transition-colors shadow-sm z-10 ${
                    addingId === prod.id_producto 
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-[#48150A] text-white hover:bg-orange-900'
                  }`}
                >
                  {addingId === prod.id_producto ? '...' : 'Añadir +'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Producto } from '@/src/features/menu/api/productos';
import { agregarProductoAlCarrito, obtenerCarrito } from '@/src/features/menu/api/Carrito';
import toast from 'react-hot-toast';
import ReseñaModal from '@/src/shared/components/reseñasModel';

export function ProductCard({
  product,
  cargarCarrito,
  mostrarBotonHistorial
}: {
  product: Producto;
  cargarCarrito: () => void;
  mostrarBotonHistorial: boolean;
}) {
  const [showDescription, setShowDescription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [averageRating] = useState<number>(0);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await agregarProductoAlCarrito(
        product.id,
        product.nombre,
        product.categoria,
        product.precio,
        1,
        []
      );
      const carrito = await obtenerCarrito();
    
      if (carrito && typeof carrito === 'object' && 'error' in carrito && carrito.error === 'NO_AUTORIZADO') {
        toast.error('⚠️ Sesión expirada. Por favor, inicia sesión.');
        return;
      }

      toast.success('✅ Producto añadido al carrito');
      await cargarCarrito();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error('⚠️ No autorizado. Inicia sesión.');
      } else {
        toast.error('❌ Error al añadir producto');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="product-card bg-[#F2EEEB] rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setShowDescription(true)}
      onMouseLeave={() => setShowDescription(false)}
    >
      <div className="relative h-68 bg-gray-200 overflow-hidden">
        {product.image_url && (
          <img
            src={
              typeof product.image_url === 'string'
                ? product.image_url
                : URL.createObjectURL(product.image_url)
            }
            alt={product.nombre}
            className="w-full h-full object-cover"
            style={{
              objectFit: 'fill', 
              objectPosition: 'center', 
              maxHeight: '600px',
              width: '400%' 
            }}
          />
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {product.sabores &&
            product.sabores.split(',').map((label, index) => (
              <span key={index} className="bg-amber-600 text-white text-xs px-2 py-1 rounded">
                {label.trim()}
              </span>
            ))}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-gray-900">
          {product.nombre || 'Producto sin nombre'}
        </h3>
        {/** Calculo de calificación promedio */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500 font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
            <span key={i}>{i < Math.round(averageRating) ? '⭐' : '☆'}</span>
            ))}
          </span>
        </div>
        <p className="text-amber-700 font-bold text-xl mb-2">Bs.{product.precio.toFixed(2)}</p>

        <div className={`overflow-hidden transition-all duration-300 max-h-40  md:max-h-0 ${showDescription ? 'md:max-h-40' : ''} `}>
          <p className="text-gray-600 text-sm">{product.descripcion}</p>

          <button
            onClick={handleAddToCart}
            className="mt-3 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Añadir al carrito'}
          </button>

          <button
            onClick={() => setShowReviewModal(true)}
            className="mt-3 bg-amber-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 transition"
          >
            Reseñas
          </button>
        </div>
      </div>

      <ReseñaModal 
        productId={product.id}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={() => {
          console.log("Reseña enviada");
        }}
      />
    </div>
  );
}

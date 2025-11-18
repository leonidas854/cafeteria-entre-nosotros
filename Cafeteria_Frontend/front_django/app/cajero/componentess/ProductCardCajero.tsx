// app/cajero/components/ProductCardCajero.tsx
'use client';

import { Producto } from '@/app/api/productos'; 

interface ProductCardCajeroProps {
  product: Producto;
  onAddToOrder: (product: Producto, quantity: number) => void;
}

export default function ProductCardCajero({ product, onAddToOrder }: ProductCardCajeroProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col">
      <div className="relative h-40 bg-gray-200">
        {product.imagen_url && (
          <img
            src={
              typeof product.imagen_url === 'string'
                ? product.imagen_url
                : URL.createObjectURL(product.imagen_url)
            }
            alt={product.nombre}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow"> {/* Reducido padding para más espacio */}
        <h3 className="font-bold text-md mb-1 text-gray-900 truncate h-6 leading-tight"> {/* Ajuste altura y leading */}
          {product.nombre || 'Producto sin nombre'}
        </h3>
        <p className="text-amber-700 font-bold text-lg mb-1"> {/* Reducido margen inferior */}
          Bs. {product.precio.toFixed(2)}
        </p>
        {product.descripcion && (
          <p className="text-gray-600 text-xs mb-2 h-10 overflow-hidden text-ellipsis flex-grow"> {/* Reducido tamaño de fuente */}
            {product.descripcion}
          </p>
        )}
        <button
          onClick={() => onAddToOrder(product, 1)}
          className="w-full mt-auto bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-700 transition" /* Reducido padding y tamaño de texto */
        >
          Añadir
        </button>
      </div>
    </div>
  );
}
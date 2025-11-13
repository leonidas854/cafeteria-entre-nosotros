'use client';

import { Promocion } from '@/app/api/Promociones';
import { Producto } from '@/app/api/productos';

interface Props {
  promo: Promocion;
  productos: Producto[];
  onAgregar: (productos: number[]) => void;
}

export default function PromocionCardCajero({ promo, productos, onAgregar }: Props) {
  return (
    <div className="bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
      {promo.full_image_url && (
        <img
          src={promo.full_image_url}
          alt="Imagen promoción"
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold text-amber-700">{promo.strategykey}</h3>
        <p className="text-sm text-gray-600 mt-1">{promo.descripcion}</p>
        <p className="text-sm text-gray-500 mt-1">
          Válido del <strong>{new Date(promo.fech_ini).toLocaleDateString()}</strong> al{' '}
          <strong>{new Date(promo.fecha_final).toLocaleDateString()}</strong>
        </p>

        <div className="mt-4 space-y-2">
          {productos.map((p, i) => {
            const precioPromo = +(p.precio * (1 - promo.descuento / 100)).toFixed(2);
            return (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
              >
                <span className="text-sm font-medium">{p.nombre}</span>
                <span>
                  <span className="text-red-500 line-through text-xs mr-1">
                    {p.precio.toFixed(2)} Bs
                  </span>
                  <span className="text-green-600 font-bold text-sm">{precioPromo} Bs</span>
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onAgregar(promo.productos)}
          className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded"
        >
          Agregar todos los productos
        </button>
      </div>
    </div>
  );
}

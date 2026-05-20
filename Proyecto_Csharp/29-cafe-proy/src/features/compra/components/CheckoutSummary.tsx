import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  obtenerCarrito,
  quitarProducto
} from '@/src/features/menu/api/Carrito';

interface ExtraCarrito {
  extraId: number;
  nombre: string;
  precio: number;
}

interface ItemCarrito {
  productoId: number;
  nombre: string;
  categoria: string;
  precioUnitario: number;
  cantidad: number;
  extras: ExtraCarrito[];
  tienePromocion: boolean;
  precioPromocional?: number;
  descripcionPromocion?: string;
}

interface CheckoutSummaryProps {
  loading: boolean;
  carrito: any;
  setCarrito: (carrito: any) => void;
  esCafe: (nombre: string, categoria?: string) => boolean;
  handleModificarCantidad: (item: ItemCarrito, nuevaCantidad: number) => void;
  handleQuitarExtra: (item: ItemCarrito, extraId: number) => void;
  handleAgregarExtra: (item: ItemCarrito, extra: ExtraCarrito) => void;
  extrasDisponibles: ExtraCarrito[];
}

export function CheckoutSummary({
  loading,
  carrito,
  setCarrito,
  esCafe,
  handleModificarCantidad,
  handleQuitarExtra,
  handleAgregarExtra,
  extrasDisponibles
}: CheckoutSummaryProps) {
  const router = useRouter();

  return (
    <div className="border-b pb-6 space-y-4">
      <h3 className="text-xl font-semibold mb-4">Tus productos</h3>
      {loading ? (
        <p className="text-gray-500">Cargando productos...</p>
      ) : carrito?.items?.length === 0 ? (
        <p className="text-gray-500">Tu carrito está vacío.</p>
      ) : (
        carrito?.items?.map((item: ItemCarrito, index: number) => {
          const precio = item.precioPromocional ?? item.precioUnitario;
          const extras = item.extras?.reduce((s, e) => s + e.precio, 0) || 0;
          const subtotal = (precio + extras) * item.cantidad;

          return (
            <div key={index} className="flex justify-between gap-4 items-start border-t pt-4">
              <div className="flex-1">
                <p className="font-medium text-base">{item.nombre}</p>

                {/* Cantidad */}
                <div className="flex items-center gap-2 my-2">
                  <button
                    onClick={() => handleModificarCantidad(item, Math.max(1, item.cantidad - 1))}
                    className="producto-cantidad-boton"
                  >
                    -
                  </button>
                  <span className="font-semibold">{item.cantidad}</span>
                  <button
                    onClick={() => handleModificarCantidad(item, item.cantidad + 1)}
                    className="producto-cantidad-boton"
                  >
                    +
                  </button>
                </div>

                {/* Extras actuales */}
                {item.extras?.length > 0 && (
                  <ul className="mt-1 ml-4 list-disc text-sm text-gray-600">
                    {item.extras.map(extra => (
                      <li key={`${item.productoId}-${extra.extraId}`} className="flex justify-between items-center">
                        <span>{extra.nombre} (+Bs{extra.precio.toFixed(2)})</span>
                        <button
                          onClick={() => handleQuitarExtra(item, extra.extraId)}
                          className="text-red-500 text-xs ml-4 hover:underline"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Agregar extras si contiene café */}
                {(esCafe(item.nombre) || esCafe(item.categoria)) && (
                  <div className="mt-2 ml-1 text-sm">
                    <p className="text-gray-700 font-semibold">Agregar extras:</p>
                    {extrasDisponibles
                      .filter(extra => extra.extraId !== undefined && !item.extras.some(e => e.extraId === extra.extraId))
                      .map(extra => (
                        <div key={`${item.productoId}-${extra.extraId}`}>
                          <button
                            onClick={() => handleAgregarExtra(item, extra)}
                            className="text-amber-700 hover:underline block text-left"
                          >
                            {extra.nombre} (+Bs{extra.precio.toFixed(2)})
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {item.precioPromocional && (
                  <p className="text-sm text-amber-600 mt-1 italic">
                    Promoción: {item.descripcionPromocion}
                  </p>
                )}
              </div>
              <p className="text-base font-bold text-gray-800 whitespace-nowrap">
                Bs{subtotal.toFixed(2)}
              </p>
              <button
                onClick={async () => {
                  try {
                    await quitarProducto(
                      item.productoId,
                      item.extras.map((e) => e.extraId)
                    );
                    const actualizado = await obtenerCarrito();

                    if (!actualizado || 'error' in actualizado) {
                      router.push('/menu');
                      return;
                    }

                    if (actualizado.items.length === 0) {
                      toast("🛒 Carrito vacío. Redirigiendo al menú...");
                      router.push('/menu');
                      return;
                    }

                    setCarrito(actualizado);

                  } catch (error) {
                    console.error("Error al eliminar producto:", error);
                    alert("No se pudo eliminar el producto. Intente nuevamente.");
                  }
                }}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Eliminar producto
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

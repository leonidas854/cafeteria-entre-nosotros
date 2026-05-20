import { ItemPedido, ExtraItemPedido } from '../type';

interface OrderItemRowProps {
  item: ItemPedido;
  handleQuitarProducto: (productoId: number, extrasIds: number[]) => void;
  handleModificarCantidad: (productoId: number, nuevaCantidad: number, extrasIds: number[]) => void;
  handleModificarExtras: (productoId: number, nuevosExtras: ExtraItemPedido[]) => void;
  handleAgregarExtra: (item: ItemPedido, extra: ExtraItemPedido) => void;
  esCafe: (nombre: string, categoria: string) => boolean;
  extrasDisponibles: ExtraItemPedido[];
}

export function OrderItemRow({
  item,
  handleQuitarProducto,
  handleModificarCantidad,
  handleModificarExtras,
  handleAgregarExtra,
  esCafe,
  extrasDisponibles
}: OrderItemRowProps) {
  return (
    <div className="border-b py-2.5 last:border-b-0">
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="font-semibold text-sm text-gray-700 leading-tight">{item.nombre}</p>
          <p className="text-xs text-gray-500">Bs. {item.precioUnitario.toFixed(2)}</p>
        </div>
        <button
          onClick={() =>
            handleQuitarProducto(
              item.productoId,
              item.extras.map((e) => e.extraId)
            )
          }
          className="text-red-500 hover:text-red-700 text-lg font-semibold p-0 leading-none"
        >
          ×
        </button>
      </div>
      <div className="flex items-center">
        <button
          onClick={() => handleModificarCantidad(item.productoId, item.cantidad - 1, item.extras.map(e => e.extraId))}
          disabled={item.cantidad <= 1}
          className="px-2 py-0.5 border rounded-l bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700"
        >
          -
        </button>
        <span className="px-3 py-0.5 border-t border-b text-gray-700 text-sm">{item.cantidad}</span>
        <button
          onClick={() => handleModificarCantidad(item.productoId, item.cantidad + 1, item.extras.map(e => e.extraId))}
          className="px-2 py-0.5 border rounded-r bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          +
        </button>
        <p className="ml-auto font-semibold text-sm text-gray-700">
          Bs. {(item.precioUnitario * item.cantidad).toFixed(2)}
        </p>
      </div>

      {item.extras.length > 0 && (
        <div className="mt-1 pl-2 space-y-1">
          {item.extras.map(extra => (
            <div key={`${item.productoId}-${extra.extraId}`}
                 className="flex justify-between items-center text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
              <span>+ {extra.nombre} (Bs. {extra.precio.toFixed(2)})</span>
              <button
                onClick={() => {
                  const nuevosExtras = item.extras.filter(e => e.extraId !== extra.extraId);
                  handleModificarExtras(item.productoId, nuevosExtras);
                }}
                className="text-red-500 hover:text-red-700 ml-2 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {esCafe(item.nombre, item.categoria) && (
        <div className="mt-1 pl-2">
          <p className="text-xs font-semibold text-gray-600">Añadir extra:</p>

          {extrasDisponibles.filter(extra => !item.extras.some(e => e.extraId === extra.extraId)).length === 0 ? (
            <p className="text-xs text-gray-400">Todos los extras ya fueron agregados.</p>
          ) : (
            extrasDisponibles
              .filter(extra => !item.extras.some(e => e.extraId === extra.extraId))
              .map(extra => (
                <button
                  key={`disp-${item.productoId}-${extra.extraId}`}
                  onClick={() => handleAgregarExtra(item, extra)}
                  className="text-xs bg-amber-100 hover:bg-amber-200 text-gray-800 rounded px-2 py-1 mr-2 mt-1"
                >
                  + {extra.nombre} (Bs. {extra.precio.toFixed(2)})
                </button>
              ))
          )}
        </div>
      )}
    </div>
  );
}

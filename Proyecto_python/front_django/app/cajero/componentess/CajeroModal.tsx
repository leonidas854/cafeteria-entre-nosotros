'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  fetchTodosPedidos,
  cambiarEstadoPedido,
  fetchTodasVentas
} from '@/app/api/Pedido';

interface Extra {
  extra_id: number;
  extraNombre: string;
  precio: number;
}

interface DetallePedido {
  producto_id: number;
  productoNombre: string;
  cantidad: number;
  precio_unitario: number;
  extras: Extra[];
}

interface VentaRelacionada {
  pedidoId: number;
  total_final: number;
  tipo_de_Pago: string;
  fecha: string;
}

interface Pedido {
  id_pedido: number;
  total_estimado: number;
  total_descuento: number;
  tipoEntrega: string;
  estado: string;
  detalles: DetallePedido[];
  venta?: VentaRelacionada;
}

interface EstadoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EstadoModal: React.FC<EstadoModalProps> = ({ isOpen, onClose }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [ventas, setVentas] = useState<VentaRelacionada[]>([]);
  const [loading, setLoading] = useState(true);
  const [sinPedidos, setSinPedidos] = useState(false);

const cargarDatos = async () => {
  try {
    setLoading(true);

    const pedidosList: Pedido[] = await new Promise((resolve) =>
      fetchTodosPedidos(resolve, setSinPedidos, () => {})
    );

   const ventasRaw: any[] = await new Promise((resolve) =>
   fetchTodasVentas(resolve, () => {}, () => {})
);

const ventasData: VentaRelacionada[] = ventasRaw.map((v) => ({
  pedidoId: v.pedidoId ?? v.PedidoId ?? v.pedido_id,
  total_final: v.total_final ?? v.Total_final,
  tipo_de_Pago: v.tipo_de_Pago ?? v.Tipo_de_Pago,
  fecha: v.fecha ?? v.Fecha,
}));

const ventasOrdenadas = ventasData.sort(
  (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
);


    const pedidosOrdenados = pedidosList.sort((a, b) => a.id_pedido - b.id_pedido); // <-- ASCENDENTE

    const pedidosConVentas = pedidosOrdenados.map((pedido) => {
      const venta = ventasOrdenadas.find((v) => v.pedidoId === pedido.id_pedido);
      return { ...pedido, venta };
    });

    setPedidos(pedidosConVentas);
    setVentas(ventasOrdenadas);


    console.log('Pedidos:', pedidosList);
console.log('Ventas:', ventasData);

  } catch (error) {
    toast.error("Ocurrió un error al cargar los datos");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const getTransicionesValidas = (tipoEntrega: string): string[] => {
    switch (tipoEntrega) {
      case 'Mesa':
      case 'Llevar':
        return ['Preparando', 'Listo', 'Entregado'];
      case 'Delivery':
        return ['Preparando', 'Listo', 'Delivery'];
      default:
        return [];
    }
  };

  const handleEstadoChange = async (pedidoId: number, nuevoEstado: string) => {
    await cambiarEstadoPedido(pedidoId, nuevoEstado);
    cargarDatos(); // <-- Se recarga automáticamente luego del cambio
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-700 px-6 py-4 sticky top-0 bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-white">Cambio de Estados - Todos los Pedidos</h2>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-400 text-center py-8">Cargando pedidos...</p>
          ) : sinPedidos ? (
            <p className="text-gray-400 text-center py-8">No hay pedidos registrados.</p>
          ) : (
            <div className="space-y-4">
              {pedidos.map((pedido) => (
                <div key={pedido.id_pedido} className="border border-gray-700 rounded-lg p-4 bg-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-white">Pedido #{pedido.id_pedido}</h3>
                    <select
                      value={pedido.estado}
                      onChange={(e) => handleEstadoChange(pedido.id_pedido, e.target.value)}
                      className="bg-gray-600 text-white text-sm rounded px-2 py-1"
                    >
                      {getTransicionesValidas(pedido.tipoEntrega).map((estado) => (
                        <option key={estado} value={estado}>
                          {estado === 'Preparando' ? 'En preparación' : estado}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-300">Tipo entrega: <span className="text-white">{pedido.tipoEntrega}</span></p>
                      <p className="text-gray-300">Total estimado: <span className="text-white">{pedido.total_estimado?.toFixed(2)} Bs</span></p>
                    </div>
                    <div>
                      <p className="text-gray-300">Descuento: <span className="text-white">{pedido.total_descuento?.toFixed(2)} Bs</span></p>
                    </div>
                    <div>
                      <p className="text-gray-300">Estado actual:
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          pedido.estado === 'Listo' ? 'bg-green-600' :
                          pedido.estado === 'Entregado' ? 'bg-blue-600' :
                          pedido.estado === 'En_preparacion' ? 'bg-yellow-600' :
                          'bg-gray-500'
                        }`}>
                          {pedido.estado.replaceAll('_', ' ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {pedido.detalles.map((detalle, index) => (
                      <div key={`${pedido.id_pedido}-${detalle.producto_id}-${index}`} className="border-t border-gray-600 pt-3">
                        <p className="text-white">
                          {detalle.productoNombre} x{detalle.cantidad}
                          <span className="text-gray-400 ml-2">{detalle.precio_unitario.toFixed(2)} Bs c/u</span>
                        </p>
                        {detalle.extras.length > 0 && (
                          <ul className="list-disc pl-5 mt-1 text-gray-400 text-sm">
                            {detalle.extras.map((extra) => (
                              <li key={extra.extra_id}>
                                {extra.extraNombre} (+{extra.precio.toFixed(2)} Bs)
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>

                  {pedido.venta && (
                    <div className="mt-4 border-t border-gray-500 pt-3 text-sm text-gray-300">
                      <p><strong>Fecha de venta:</strong> {new Date(pedido.venta.fecha).toLocaleString()}</p>
                      <p><strong>Tipo de pago:</strong> {pedido.venta.tipo_de_Pago}</p>
                      <p><strong>Total final:</strong> {pedido.venta.total_final.toFixed(2)} Bs</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 px-6 py-4 flex justify-end sticky bottom-0 bg-gray-800">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstadoModal;

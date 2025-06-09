'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

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

interface Pedido {
  id_pedido: number;
  total_estimado: number;
  total_descuento: number;
  tipoEntrega: string;
  estado: string;
  detalles: DetallePedido[];
}

interface EstadoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EstadoModal: React.FC<EstadoModalProps> = ({ isOpen, onClose }) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [sinPedidos, setSinPedidos] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTodosPedidos = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/Pedido/todos-pedidos`, {
          withCredentials: true
        });

        if (res.data.length === 0) {
          setSinPedidos(true);
        } else {
          setPedidos(res.data);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setSinPedidos(true);
        } else {
          toast.error("No se pudieron cargar los pedidos.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodosPedidos();
  }, [isOpen]);

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
                <div
                  key={pedido.id_pedido}
                  className="border border-gray-700 rounded-lg p-4 bg-gray-700"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        Pedido #{pedido.id_pedido}
                        }
                      </h3>
                    </div>
                    <select
                      value={pedido.estado}
                      onChange={(e) => {
                        // Aquí la lógica para actualizar el estado 
                        const nuevosPedidos = pedidos.map(p => 
                          p.id_pedido === pedido.id_pedido ? {...p, estado: e.target.value} : p
                        );
                        setPedidos(nuevosPedidos);
                      }}
                      className="bg-gray-600 text-white text-sm rounded px-2 py-1"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="En_preparacion">En preparación</option>
                      <option value="Listo">Listo</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-300">Tipo entrega: <span className="text-white">{pedido.tipoEntrega}</span></p>
                      <p className="text-gray-300">Total: <span className="text-white">{pedido.total_estimado?.toFixed(2)} Bs</span></p>
                    </div>
                    <div>
                      <p className="text-gray-300">Descuento: <span className="text-white">{pedido.total_descuento?.toFixed(2)} Bs</span></p>
                    </div>
                    <div className="md:col-span-1">
                      <p className="text-gray-300">Estado actual: 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          pedido.estado === 'Confirmado' ? 'bg-green-600' :
                          pedido.estado === 'Cancelado' ? 'bg-red-600' :
                          pedido.estado === 'Entregado' ? 'bg-blue-600' :
                          'bg-yellow-600'
                        }`}>
                          {pedido.estado.replaceAll('_', ' ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {pedido.detalles?.map((detalle, index) => (
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
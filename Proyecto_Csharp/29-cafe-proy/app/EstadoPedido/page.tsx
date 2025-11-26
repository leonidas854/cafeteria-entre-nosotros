'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Menu from '@/app/components/Menu';
import toast, { Toaster } from 'react-hot-toast';
import "./menu.css";
import { fetchPedidos, fetchVentas } from "@/app/api/Pedido";

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

export default function MisPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [sinPedidos, setSinPedidos] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      new Promise<any[]>((resolve) => fetchPedidos(resolve, () => {}, () => {})),
      new Promise<any[]>((resolve) => fetchVentas(resolve, () => {}, () => {}))
    ])
      .then(([pedidosData, ventasData]) => {
        const pedidosConVenta = pedidosData.map((pedido: any) => {
          const venta = ventasData.find((v) => v.pedidoId === pedido.id_pedido);
          return { ...pedido, venta };
        });
        setPedidos(pedidosConVenta);
      })
      .catch(() => {
        toast.error("Error al cargar pedidos o ventas");
        setSinPedidos(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <Menu />
      <div className="max-w-4xl mx-auto py-20 px-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">📦 Mis Pedidos</h1>
        {loading ? (
          <p className="text-gray-500">Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-gray-500">No se encontraron pedidos.</p>
        ) : (
          pedidos.map((pedido) => (
            <div
              key={pedido.id_pedido}
              className="border border-amber-300 bg-[#FFF8F0] rounded-xl shadow-md p-6 mb-6 transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-blue-800">Pedido #{pedido.id_pedido}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pedido.estado === 'Confirmado'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {pedido.estado.replaceAll('_', ' ')}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-1">
                Tipo de entrega: <strong>{pedido.tipoEntrega}</strong>
              </p>
              <p className="text-sm text-gray-700 mb-1">
                Total : <strong>{pedido.total_estimado?.toFixed(2)} Bs</strong>
              </p>
              <p className="text-sm text-gray-700 mb-4">
                Descuento: <strong>{pedido.total_descuento?.toFixed(2)} Bs</strong>
              </p>

              <div className="space-y-4">
                {pedido.detalles?.map((detalle, index) => (
                  <div
                    key={`${pedido.id_pedido}-${detalle.producto_id}-${index}`}
                    className="border-t pt-3"
                  >
                    <p className="text-base font-medium text-gray-900">
                      {detalle.productoNombre} x{detalle.cantidad}
                    </p>
                    <p className="text-sm text-gray-600">
                      Precio unitario: {detalle.precio_unitario.toFixed(2)} Bs
                    </p>
                    {detalle.extras.length > 0 && (
                      <ul className="list-disc pl-6 mt-1 text-sm text-gray-600">
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
                <div className="mt-4 border-t pt-3 text-sm text-gray-700">
                  <p><strong>Fecha de venta:</strong> {new Date(pedido.venta.fecha).toLocaleString()}</p>
                  <p><strong>Tipo de pago:</strong> {pedido.venta.tipo_de_Pago}</p>
                  <p><strong>Total final:</strong> {pedido.venta.total_final.toFixed(2)} Bs</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

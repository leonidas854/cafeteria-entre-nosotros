'use client';

import { useState } from 'react';
import type { VentaReportItem } from './ReportsSection';

interface VentaReportCardListProps {
  items: VentaReportItem[];
}

function VentaCard({ item }: { item: VentaReportItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const estadoColor = {
    'Pendiente': 'bg-yellow-200 text-yellow-800',
    'En_preparacion': 'bg-blue-200 text-blue-800',
    'Listo_para_entrega': 'bg-indigo-200 text-indigo-800',
    'En_camino': 'bg-purple-200 text-purple-800',
    'Entregado': 'bg-green-200 text-green-800',
    'Cancelado': 'bg-red-200 text-red-800',
  };

  return (
    <li className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div className="font-bold text-lg text-gray-700">#{item.id}</div>
          <div className="text-sm text-gray-600">{item.fecha}</div>
          <div className="font-medium text-gray-800">{item.cliente}</div>
        </div>
        <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${estadoColor[item.estado as keyof typeof estadoColor] || 'bg-gray-200 text-gray-800'}`}>
                {item.estado.replace(/_/g, ' ')}
            </span>
            <div className="font-bold text-lg text-green-600">{item.total.toFixed(2)} Bs.</div>
            <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Detalles del Pedido</h4>
              <p className="text-sm"><span className="font-medium">Atendido por:</span> {item.empleado}</p>
              <p className="text-sm"><span className="font-medium">Entrega:</span> {item.tipoEntrega}</p>
              <p className="text-sm"><span className="font-medium">Pago:</span> {item.tipoPago}</p>
            </div>
            <div>
                <h4 className="font-semibold text-gray-700 mb-2">Productos</h4>
                <ul className="list-disc list-inside space-y-1">
                {item.detalles.map((d, index) => (
                    <li key={index} className="text-sm">
                    {d.cantidad}x {d.productoNombre} - {(d.cantidad * d.precioUnitario).toFixed(2)} Bs.
                    {d.extras.length > 0 && (
                        <ul className="list-['+'] list-inside pl-4 text-xs text-gray-500">
                        {d.extras.map((e, i) => <li key={i}>{e.nombre}</li>)}
                        </ul>
                    )}
                    </li>
                ))}
                </ul>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default function VentaReportCardList({ items }: VentaReportCardListProps) {
  return (
    <ul className="space-y-3">
      {items.map(item => (
        <VentaCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
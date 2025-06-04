'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface CajeroHeaderProps {
  onLogout: () => void;
}

export default function CajeroHeader({ onLogout }: CajeroHeaderProps) {
  const [nombreCajero, setNombreCliente] = useState('');

  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      const nombre = sessionStorage.getItem('nombreCajero');
      if (nombre) {
        setNombreCliente(nombre);
      }
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-20 bg-gray-800 text-white flex items-center justify-between px-6 shadow-md z-50">
      <h1 className="text-2xl font-bold">
        Punto de Venta Cajero : {nombreCajero? ` - ${nombreCajero}` : ''}
      </h1>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import EstadoModal from './CajeroModal';

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


const [isModalOpen, setIsModalOpen] = useState(false);


const toggleModal = () => {
  setIsModalOpen(!isModalOpen);
};

  return (
    <div className="fixed top-0 left-0 right-0 h-20 bg-gray-800 text-white flex items-center justify-between px-6 shadow-md z-50">
      <h1 className="text-2xl font-bold">
        Punto de Venta Cajero : {nombreCajero? ` - ${nombreCajero}` : ''}
      </h1>
      <div className="flex gap-2">
          <button
            onClick={toggleModal} 
            className="bg-[#FBC017] text-gray-800 px-4 py-2 rounded hover:bg-[#E0DCD9] transition-colors"
          >
            Cambiar Estados
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
           <EstadoModal isOpen={isModalOpen} onClose={toggleModal} />
        </div>
       
    </div>
  );
}

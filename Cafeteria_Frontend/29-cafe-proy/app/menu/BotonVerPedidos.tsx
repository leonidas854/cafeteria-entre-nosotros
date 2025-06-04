'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // o 'next/router' en versiones anteriores

export default function BotonVerPedidos() {
  const [clienteLogeado, setClienteLogeado] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const nombreCliente = sessionStorage.getItem('nombreCliente');
    if (nombreCliente) {
      setClienteLogeado(true);
    }
  }, []);

  if (!clienteLogeado) return null; 

  return (
    <button
      className="bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2" 
      onClick={(e) => {
        e.preventDefault();
        router.push("/EstadoPedido");
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      VER LISTA DE PEDIDOS
    </button>
  );
}

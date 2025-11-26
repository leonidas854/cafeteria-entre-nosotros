'use client';
import { useEffect, useState } from 'react';
import "./Bienvenida.css"

export default function Bienvenida() {
  const [nombreCliente, setNombreCliente] = useState('');

  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      const nombre = sessionStorage.getItem('nombreCliente');
      if (nombre) {
        setNombreCliente(nombre);
      }
    }
  }, []);

  if (!nombreCliente) return null; 
return (
  <div className="bienvenida-linea bienvenida-animate">
    <span className="bienvenida-linea-titulo">BIENVENIDO</span>
    <span className="bienvenida-linea-nombre">{nombreCliente}</span>
    <span className="bienvenida-linea-frase">"La amistad se sirve con café"</span>
  </div>
);
}
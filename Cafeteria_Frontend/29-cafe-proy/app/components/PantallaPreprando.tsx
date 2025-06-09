import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import Link from 'next/link';
import "./Robot.css"; 

interface PantallaPreparandoProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerarFactura: () => void;
}

export default function PantallaPreparando({ 
  isOpen, 
  onClose, 
  onGenerarFactura 
}: PantallaPreparandoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#FAEFD3] rounded-lg p-8 max-w-4xl w-full flex flex-col md:flex-row gap-8">
        {/* Columna izquierda - Robot Spline */}
        <div className="flex-1 ">
          
            <div className="spline-container ">
              
                <Spline 
                  scene="https://prod.spline.design/Ty9GcVmEKCjvOACd/scene.splinecode"
                  className="w-full h-full"
                />
              
          </div>
        </div>

        {/* Columna derecha - Contenido */}

        <div className="flex-1 flex flex-col items-center justify-center text-center">
  
        <div className="mb-6">
            <img 
            src="./logo.png" 
            alt="Logo" 
            className="h-48 w-auto" 
            />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">PEDIDO PREPARÁNDOSE</h2>
        <p className="text-gray-600 mb-6">  Espere 5 minutos, le avisaremos<br />
        cuando su pedido se despache 
         <span className="text-sm text-amber-700 inline-block mt-1">
        Mientras juegue con Amiguito <span className="emoji delay-200">🤖</span>, (fíjese cómo le persigue 
        <span className="emoji">👀</span>)
        
        </span>
        </p>
  
        <div className="flex flex-col space-y-3 w-full max-w-xs"> 

            <Link href="https://siatinfo.impuestos.gob.bo/index.php/facturacion-en-linea/factura-electronica">
            <button
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors w-full">
             Generar Factura
            </button>
            </Link>

            <Link href="/EstadoPedido">
            <button className="px-6 py-3 bg-amber-400 text-white rounded-lg hover:bg-amber-700 transition-colors w-full">
            Ver Historial
            </button>
            </Link>
    
            <button
              onClick={onClose}
                className="px-6 py-3 border border-gray-900 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full"
             >
                 Cerrar
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
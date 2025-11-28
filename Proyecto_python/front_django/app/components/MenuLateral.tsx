'use client';

import { useEffect, useState } from 'react';
import "./menuiz.css";
import type { GroupedProducts } from '../menu/page';


const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export interface MenuLateralProps {
  groupedProducts: GroupedProducts;
  onSelectCategory: (category: string, subcategory?: string | null) => void;
  onClose: () => void; // Para cerrar en móvil
  activeCategory: string | null;
  activeSubcategory: string | null;
}

export default function MenuLateral({
  groupedProducts,
  onSelectCategory,
  onClose,
  activeCategory,
  activeSubcategory,
}: MenuLateralProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(activeCategory);

  // Sincroniza el menú abierto si la categoría activa cambia desde fuera
  useEffect(() => {
    if (activeCategory) {
      setOpenCategory(activeCategory);
    }
  }, [activeCategory]);

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const handleSelect = (category: string, subcategory: string | null = null) => {
    onSelectCategory(category, subcategory);
    // Opcional: cierra el menú lateral en móvil después de seleccionar
    // onClose();
  };
  
  const categorias = Object.entries(groupedProducts);

  return (
    <nav className="h-full flex flex-col bg-gray-900 text-gray-300 shadow-lg">
      {/* --- ENCABEZADO DEL MENÚ Y BOTÓN DE CIERRE (para móvil) --- */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Categorías</h2>
        <button 
          onClick={onClose} 
          className="lg:hidden p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
          aria-label="Cerrar menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* --- LISTA DE CATEGORÍAS (con scroll si es necesario) --- */}
      <ul className="flex-1 overflow-y-auto p-2">
        {categorias.map(([categoria, data]) => {
          const subcategorias = data.subcategorias ? Object.keys(data.subcategorias) : [];
          const tieneSubcategorias = subcategorias.length > 0;
          const estaActiva = activeCategory === categoria && activeSubcategory === null;
          const estaAbierta = openCategory === categoria;

          return (
            <li key={categoria} className="mb-1">
              {/* --- BOTÓN DE CATEGORÍA PRINCIPAL --- */}
              <div 
                className={`flex items-center justify-between w-full rounded-md transition-colors duration-200 ${
                  estaActiva ? 'bg-amber-600 text-white' : 'hover:bg-gray-700'
                }`}
              >
                <button
                  onClick={() => handleSelect(categoria)}
                  className="flex-grow text-left px-4 py-3"
                >
                  <span className="font-semibold">{categoria}</span>
                </button>

                {/* Botón de flecha solo si hay subcategorías */}
                {tieneSubcategorias && (
                  <button 
                    onClick={() => toggleCategory(categoria)}
                    className="p-3"
                    aria-expanded={estaAbierta}
                  >
                    <span className={`transform transition-transform duration-300 ${estaAbierta ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon />
                    </span>
                  </button>
                )}
              </div>

              {/* --- SUBCATEGORÍAS (Desplegable) --- */}
              {tieneSubcategorias && (
                <ul
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    estaAbierta ? 'max-h-96' : 'max-h-0' // Animación con max-height
                  }`}
                >
                  {subcategorias.map((sub) => {
                    const subEstaActiva = activeCategory === categoria && activeSubcategory === sub;
                    return (
                      <li key={sub}>
                        <button
                          onClick={() => handleSelect(categoria, sub)}
                          className={`w-full text-left flex items-center px-4 py-2 pl-10 text-sm transition-colors duration-200 rounded-md ${
                            subEstaActiva ? 'bg-amber-600 text-white font-bold' : 'hover:bg-gray-700'
                          }`}
                        >
                          <span>- {sub}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
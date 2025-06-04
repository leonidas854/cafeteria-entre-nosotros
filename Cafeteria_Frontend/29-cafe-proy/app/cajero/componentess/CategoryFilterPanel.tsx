'use client';

import { GroupedProducts } from '../type';
import { Promocion } from '@/app/api/Promociones';

interface CategoryFilterPanelProps {
  groupedProducts: GroupedProducts;
  activeCategory: string | null;
  activeSubcategory: string | null;
  onSelectCategory: (category: string | null, subcategory?: string | null) => void;
  isLoading: boolean;
  promociones: Promocion[];
  loadingPromo: boolean;
}

export default function CategoryFilterPanel({
  groupedProducts,
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  isLoading,
  promociones,
  loadingPromo,
}: CategoryFilterPanelProps) {
  return (
    <div className="w-56 bg-gray-800 p-4 overflow-y-auto shadow-lg fixed top-20 bottom-0 left-0">
      <h2 className="text-lg font-semibold mb-3 text-amber-400">Categorías</h2>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Cargando categorías...</p>
      ) : (
        <ul>
          {/* Todos los productos */}
          <li key="todos-filter" className="mb-1">
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-gray-700 transition-colors duration-150 text-sm ${
                !activeCategory ? 'bg-amber-600 text-white font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Todos los Productos
            </button>
          </li>

          {/* Promociones si existen */}
          {!loadingPromo && promociones.length > 0 && (
            <li key="promociones" className="mb-1">
              <button
                onClick={() => onSelectCategory('Promociones')}
                className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-gray-700 transition-colors duration-150 text-sm ${
                  activeCategory === 'Promociones' ? 'bg-amber-600 text-white font-semibold' : 'text-gray-300 hover:text-white'
                }`}
              >
                🏷️ Promociones
              </button>
            </li>
          )}

          {/* Categorías normales */}
          {Object.entries(groupedProducts).map(([categoria, data]) => (
            <li key={categoria} className="mb-1">
              <button
                onClick={() => onSelectCategory(categoria, null)}
                className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-gray-700 transition-colors duration-150 text-sm ${
                  activeCategory === categoria && !activeSubcategory
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {categoria}
              </button>
              {activeCategory === categoria && data.subcategorias && (
                <ul className="pl-3 mt-1 space-y-0.5">
                  {Object.keys(data.subcategorias).map((sub) => (
                    <li key={sub}>
                      <button
                        onClick={() => onSelectCategory(categoria, sub)}
                        className={`w-full text-left px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors duration-150 ${
                          activeSubcategory === sub
                            ? 'bg-amber-500 text-white font-medium'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

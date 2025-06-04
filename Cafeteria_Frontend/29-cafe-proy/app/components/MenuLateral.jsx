'use client';

import { useState } from 'react';
import "./menuiz.css";

export default function MenuLateral({ groupedProducts, onSelectCategory }) {
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const toggleSubmenu = (id) => {
    setActiveSubmenu(activeSubmenu === id ? null : id);
  };

  const handleCategoryClick = (category, subcategory = null) => {
    onSelectCategory(category, subcategory);
  };
  const categorias = Object.entries(groupedProducts); // [["CAFE EN GRANO", [...]], ["BEBIDAS CALIENTES CON CAFE", { Espresso: [...], ... }], ...]

/*
  const menuItems = [
    { id: 1, text: "CAFE EN GRANO", icon: "icon-promo" },
    {
      id: 2,
      text: "BEBIDAS CALIENTES CON CAFE",
      icon: "icon-user",
      submenu: [
        { text: "Espresso", icon: "icon-coffee" },
        { text: "Americano", icon: "icon-cake" },
        { text: "Capuccino", icon: "icon-food" },
        { text: "Mokaccino", icon: "icon-food" }
      ]
    },
    {
      id: 3,
      text: "BEBIDAS CALIENTES SIN CAFE",
      icon: "icon-user",
      submenu: [
        { text: "Chocolate", icon: "icon-team" },
        { text: "Chai Latte", icon: "icon-history" },
        { text: "Te", icon: "icon-location" }
      ]
    },
    {
      id: 4,
      text: "BEBIDAS FRIAS CON CAFE",
      icon: "icon-user",
      submenu: [
        { text: "Frappé Capuccino", icon: "icon-team" },
        { text: "Latte Ice", icon: "icon-history" },
        { text: "Viennesa Affogato", icon: "icon-location" },
        { text: "Café Frappé", icon: "icon-location" },
        { text: "Café Ice", icon: "icon-location" }
      ]
    },
    { id: 5, text: "TES FRIOS", icon: "icon-promo" },
    { id: 6, text: "DESAYUNOS", icon: "icon-gallery" },
    { id: 7, text: "BEBIDAS CON FRUTAS", icon: "icon-events" },
    { id: 8, text: "REPOSTERIA", icon: "icon-contact" }
  ];*/

 return (
    <div className="nav-container">
      <ul className="nav">
        {categorias.map(([categoria, data], idx) => {
          const subcategorias = data.subcategorias
            ? Object.entries(data.subcategorias)
            : [];
          const tieneSubcategorias = subcategorias.length > 0;
          const tieneSinSubcategoria =
            data.sinSubcategoria && data.sinSubcategoria.length > 0;

          return (
            <li
              key={idx}
              className={tieneSubcategorias ? 'has-submenu' : ''}
              data-active={activeSubmenu === idx}
            >
              <button
                onClick={() =>
                  tieneSubcategorias
                    ? toggleSubmenu(idx)
                    : handleCategoryClick(categoria)
                }
                className="w-full text-left flex items-center px-4 py-3 hover:bg-gray-100"
              >
                <span className="icon-folder" />
                <span className="text ml-2">{categoria}</span>
                {tieneSubcategorias && (
                  <span className="dropdown-arrow ml-auto">▼</span>
                )}
              </button>

              {/* Subcategorías si existen */}
              {tieneSubcategorias && (
                <ul
                  className="submenu"
                  style={{
                    maxHeight:
                      activeSubmenu === idx
                        ? `${(subcategorias.length + (tieneSinSubcategoria ? 1 : 0)) * 50}px`
                        : '0',
                  }}
                >
                  {subcategorias.map(([sub, _], subIdx) => (
                    <li key={subIdx}>
                      <button
                        onClick={() => handleCategoryClick(categoria, sub)}
                        className="w-full text-left flex items-center px-4 py-2 pl-12 hover:bg-gray-100"
                      >
                        <span className="icon-dot" />
                        <span className="text ml-2">{sub}</span>
                      </button>
                    </li>
                  ))}

                  {/* Productos sin subcategoría visibles como "Otros" */}
                  {tieneSinSubcategoria && (
                    <li key="otros">
                      <button
                        onClick={() => handleCategoryClick(categoria, null)}
                        className="w-full text-left flex items-center px-4 py-2 pl-12 hover:bg-gray-100"
                      >
                        <span className="icon-dot" />
                        <span className="text ml-2">Otros</span>
                      </button>
                    </li>
                  )}
                </ul>
              )}

              {/* Si no tiene subcategorías pero sí productos directos */}
              {!tieneSubcategorias && tieneSinSubcategoria && (
                <ul>
                  <li>
                    <button
                      onClick={() => handleCategoryClick(categoria)}
                      className="w-full text-left flex items-center px-4 py-2 pl-12 hover:bg-gray-100"
                    >
                      <span className="icon-dot" />
                      <span className="text ml-2">Ver productos</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
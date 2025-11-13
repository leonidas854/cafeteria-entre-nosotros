'use client';
import React from "react";
import MenuItem from "./MenuItem";
import { useRouter } from "next/navigation";
import PropTypes from 'prop-types';

const Menu = ({ initialCarrito = null, loading = false, onUpdateCart }) => {
  const router = useRouter();
  const [activeItem, setActiveItem] = React.useState("Inicio");

  // Calcular totales usando initialCarrito
  const totalItems = initialCarrito?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
  const totalAmount = initialCarrito?.items?.reduce((sum, item) => {
    const precio = item.precioPromocional ?? item.precioUnitario;
    const extras = item.extras?.reduce((s, e) => s + e.precio, 0) || 0;
    return sum + (precio + extras) * item.cantidad;
  }, 0) || 0;

  const menuItems = [
    { text: "Inicio", path: "/" },
    { text: "Menu", path: "/menu" }, 
    { text: "Promociones", path: "/#prom" },
    { text: "Login", path: "/LoginClientes" },
  ];

  const handleClick = (item) => {
    setActiveItem(item.text);
    if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <nav className="menu-container">
      {/* Logo y nombre */}
      <div className="logo-brand-container flex items-center">  
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="logo h-10 w-10 mr-2"
          onClick={() => {
            setActiveItem("Inicio");
            router.push("/");
          }}
          style={{ cursor: "pointer" }}
        />
        <span className="cafe-name text-white font-bold">ENTRE AMIGOS</span> 
      </div>
      
      {/* Contenedor del carrito + ítems del menú */}
      <div className="flex items-center gap-4">
        {/* Componente de resumen de productos */}
        <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg shadow-sm border border-amber-700">
          <div className="flex items-center">
            {/* Icono de carrito */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-amber-700" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            <span className="ml-2 text-sm font-semibold text-white">
              {loading ? 'Cargando...' : `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`}
            </span>
          </div>
          <div className="text-sm font-bold text-amber-700 ml-4">
            ${totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Ítems del menú */}
        <ul className="menu flex gap-2">
          {menuItems.map((item) => (
            <MenuItem
              key={item.text}
              text={item.text}
              icon={item.icon}
              isActive={activeItem === item.text}
              onClick={() => handleClick(item)}  
            />
          ))}
        </ul>
      </div>
    </nav>
  );
};

Menu.propTypes = {
  initialCarrito: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        cantidad: PropTypes.number,
        precioUnitario: PropTypes.number,
        precioPromocional: PropTypes.number,
        extras: PropTypes.arrayOf(
          PropTypes.shape({
            precio: PropTypes.number
          })
        )
      })
    )
  }),
  loading: PropTypes.bool,
  onUpdateCart: PropTypes.func
};

Menu.defaultProps = {
  initialCarrito: null,
  loading: false,
  onUpdateCart: () => {}
};

export default Menu;
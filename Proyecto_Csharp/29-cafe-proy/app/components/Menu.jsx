import React, { useState, useEffect } from "react";
import MenuItem from "./MenuItem";
import { useRouter } from "next/navigation";
import Clock from "./Reloj";

const Menu = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("Inicio");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { text: "Inicio", path: "/" },
    { text: "Menu", path: "/menu" }, 
    { text: "Promociones", path: "/#prom" },
    { text: "Login", path: "/LoginClientes" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Ajusta este valor según necesites
      if (window.innerWidth > 768) {
        setMenuOpen(false); // Cierra el menú si se redimensiona a pantalla grande
      }
    };

    // Verificar al montar el componente
    handleResize();
    
    // Escuchar cambios de tamaño
    window.addEventListener("resize", handleResize);
    
    // Limpiar el event listener al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (item) => {
    setActiveItem(item.text);
    if (item.path) {
      router.push(item.path);
    }
    if (isMobile) {
      setMenuOpen(false); // Cierra el menú después de seleccionar un ítem en móvil
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

const HamburgerIcon = ({ isOpen }) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d={isOpen ? 
        "M4 4L20 20M4 20L20 4" : 
        "M3 12H21M3 6H21M3 18H21"}
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-300 ease-in-out"
    />
  </svg>
);


  return (
    <nav className="menu-container">
      <div className="logo-brand-container">  
        <img 
          src="https://res.cloudinary.com/dmrszrfdx/image/upload/v1763330782/logo_cizy3g.png" 
          alt="Logo" 
          className="logo"
          onClick={() => {
            setActiveItem("Inicio");
            router.push("/");
          }}
          style={{ cursor: "pointer" }}
        />
        <span className="cafe-name">ENTRE AMIGOS</span> 
        <Clock />
        
        {/* Botón de hamburguesa para móviles */}
        {isMobile && (
          <button className="hamburger-button" onClick={toggleMenu}>
              <HamburgerIcon isOpen={menuOpen} />
          </button>
        )}
      </div>
      
      {/* Menú principal - oculto en móviles cuando no está abierto */}
      <ul className={`menu ${isMobile ? (menuOpen ? "mobile-menu-open" : "mobile-menu-closed") : ""}`}>
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
    </nav>
  );
};

export default Menu;
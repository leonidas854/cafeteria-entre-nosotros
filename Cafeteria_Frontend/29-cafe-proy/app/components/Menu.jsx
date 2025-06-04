import React, { useState } from "react";
import MenuItem from "./MenuItem";
import { useRouter } from "next/navigation";
import Clock from "./Reloj"; 


const Menu = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("Inicio");

  const menuItems = [
    { text: "Inicio", path: "/" },
    { text: "Menu", path: "/menu" }, 
    { text: "Promociones", path: "/#prom" },
    { text: "Login", path: "/LoginClientes" },
  ];

  const handleClick = (item) => {
    setActiveItem(item.text);  // Actualiza el ítem activo
    if (item.path) {
      router.push(item.path);  // Navega a la ruta
    }
  };

  return (
    <nav className="menu-container">
      {}
      <div className="logo-brand-container">  
        <img 
          src="/logo.png" 
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
      </div>
      
      <ul className="menu">
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
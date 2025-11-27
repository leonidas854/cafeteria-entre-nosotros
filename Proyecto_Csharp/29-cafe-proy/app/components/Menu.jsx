import React, { useState, useEffect } from "react";
import MenuItem from "./MenuItem";
import { useRouter } from "next/navigation";
// Clock ha sido eliminado previamente.

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
            setIsMobile(window.innerWidth <= 768); 
            if (window.innerWidth > 768) {
                setMenuOpen(false); 
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleClick = (item) => {
        setActiveItem(item.text);
        if (item.path) {
            router.push(item.path);
        }
        if (isMobile) {
            setMenuOpen(false); 
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
            className="text-white" 
        >
            <path
                d={isOpen ? 
                    "M4 4L20 20M4 20L20 4" : 
                    "M3 12H21M3 6H21M3 18H21"}
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 ease-in-out"
            />
        </svg>
    );


    return (
        // Cabecera principal: Fija la posición y controla el z-index
        <nav className="menu-container flex items-center justify-between z-2000">
            
            {/* 1. Contenedor Izquierdo: Hamburguesa y Logo/Nombre */}
            <div className="flex items-center">
                
                {/* Botón de hamburguesa para móviles */}
                {isMobile && (
                    <button className="hamburger-button p-2" onClick={toggleMenu} aria-label="Toggle navigation">
                        <HamburgerIcon isOpen={menuOpen} />
                    </button>
                )}

                {/* Logo y nombre */}
                <div className="logo-brand-container flex items-center ml-2">
                    <img 
                        src="https://res.cloudinary.com/dmrszrfdx/image/upload/v1763330782/logo_cizy3g.png" 
                        alt="Logo" 
                        className="logo h-10 w-10" 
                        onClick={() => {
                            setActiveItem("Inicio");
                            router.push("/");
                        }}
                        style={{ cursor: "pointer" }}
                    />
                    {/* El nombre es visible */}
                    <span className="cafe-name text-white font-bold ml-2">ENTRE AMIGOS</span> 
                </div>
            </div>
            
            {/* 2. Menú principal (Derecha en escritorio) */}
            {/* Si existían botones de navegación estáticos aquí en la versión móvil, han sido eliminados.
                Solo se muestra la lista de enlaces en pantallas grandes. */}
            <ul className="hidden md:flex gap-4">
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

            {/* 3. Menú Desplegable (Móvil) - ÚNICA fuente de navegación en móvil */}
            <div className={`
                md:hidden 
                fixed top-0 left-0 h-full w-64 bg-amber-700 z-30 
                transform transition-transform duration-300 ease-in-out
                ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Header/Botón de Cierre del Menú Lateral */}
                <div className="p-4 flex items-center justify-between bg-amber-800 border-b border-amber-600">
                    {/* FIJO: Título del menú cambiado a "Café de I" */}
                    <span className="text-white font-bold text-lg">Cafetería Entre Nosotros</span>
                    <button onClick={toggleMenu} className="text-white p-2" aria-label="Cerrar menú">
                        {/* Ícono de X para cerrar */}
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Ítems del menú. ESTOS son los únicos botones activos de navegación en móvil. */}
                <ul className="flex flex-col gap-2 p-4">
                    {menuItems.map((item) => (
                        <MenuItem 
                            key={item.text}
                            text={item.text}
                            icon={item.icon}
                            isActive={activeItem === item.text}
                            onClick={() => handleClick(item)}
                            className="text-white p-2 block hover:bg-amber-600 rounded" 
                        />
                    ))}
                </ul>
            </div>
            
            {/* 4. Overlay/Dimmer */}
            {menuOpen && isMobile && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-25 md:hidden" 
                    onClick={toggleMenu}
                ></div>
            )}
        </nav>
    );
};

export default Menu;
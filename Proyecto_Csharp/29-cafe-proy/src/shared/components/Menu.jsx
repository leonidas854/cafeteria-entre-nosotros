'use client';
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "@/src/shared/styles/navbar.css";

/**
 * Navbar principal — Cafetería Entre Amigos
 * Importa su propio CSS (navbar.css). No necesita que las páginas importen menu.css.
 */
const Menu = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const menuItems = [
        { text: "Inicio", path: "/" },
        { text: "Menú", path: "/menu" },
        { text: "Promociones", path: "/#prom" },
        { text: "Login", path: "/LoginClientes" },
    ];

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setMenuOpen(false);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Cerrar sidebar con Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [menuOpen]);

    // Bloquear scroll del body cuando sidebar está abierta
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const isActive = (path) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    const handleClick = (item) => {
        if (item.path) {
            router.push(item.path);
        }
        if (isMobile) {
            setMenuOpen(false);
        }
    };

    return (
        <>
            <nav className="menu-container">
                {/* Left: Hamburger + Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isMobile && (
                        <button
                            className="hamburger-button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Abrir menú de navegación"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {menuOpen ? (
                                    <path d="M4 4L20 20M4 20L20 4" />
                                ) : (
                                    <path d="M3 12H21M3 6H21M3 18H21" />
                                )}
                            </svg>
                        </button>
                    )}

                    <div className="logo-brand-container">
                        <img
                            src="https://res.cloudinary.com/dmrszrfdx/image/upload/v1763330782/logo_cizy3g.png"
                            alt="Logo Cafetería Entre Amigos"
                            className="logo"
                            onClick={() => router.push("/")}
                        />
                        <span className="cafe-name">ENTRE AMIGOS</span>
                    </div>
                </div>

                {/* Right: Desktop nav items */}
                {!isMobile && (
                    <ul className="menu">
                        {menuItems.map((item) => (
                            <li
                                key={item.text}
                                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => handleClick(item)}
                            >
                                {item.text}
                            </li>
                        ))}
                    </ul>
                )}
            </nav>

            {/* Mobile Sidebar */}
            <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span className="sidebar-title">Cafetería Entre Amigos</span>
                    <button
                        className="sidebar-close"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <ul className="sidebar-nav">
                    {menuItems.map((item) => (
                        <li
                            key={item.text}
                            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleClick(item)}
                        >
                            {item.text}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Overlay */}
            <div
                className={`sidebar-overlay ${menuOpen ? 'visible' : ''}`}
                onClick={() => setMenuOpen(false)}
            />
        </>
    );
};

export default Menu;
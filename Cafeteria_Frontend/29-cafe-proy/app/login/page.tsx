'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from "next/link";
import "./login.css";
import "./menu.css";
import { loginEmpleado } from '@/app/api/LoginEmpleado'; 
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.removeItem("usuario");
  localStorage.removeItem("auth");

  }, []);

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const usuario = (form.username as HTMLInputElement).value.trim();
  const password = (form.password as HTMLInputElement).value.trim();

  const response = await loginEmpleado({ usuario, password });

  

  const rol = response.rol?.toLowerCase();

  if (rol === "admin" || rol === "administrador") {
    localStorage.setItem("usuario", "Administrador");
    router.push("/administrador");
  } else if (rol === "cajero") {
  
    router.push("/cajero");
  } else {
    toast.error("⚠️ Rol no autorizado");
  }
};

  return (
    <div className="login-page">
      <Toaster position="top-right" />
      <div className="login-container">
        
        <h2 className="text-4xl md:text-5xl text-black font-urwclassico mb-8">
          Iniciar Sesión
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input 
              type="text" 
              id="username" 
              className="form-input"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              className="form-input"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

          <button type="submit" className="login-button">
            Ingresar
          </button>

          <Link href="/registro">
            <button type="button" className="login-button">
              Crear Cuenta
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}

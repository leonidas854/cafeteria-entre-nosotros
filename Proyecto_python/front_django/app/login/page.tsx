'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from "next/link";
import "./login.css"; 
import "./menu.css";   
import Menu from "../components/Menu.jsx";
import { loginEmpleado } from '@/app/api/LoginEmpleado'; 
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  useEffect(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("auth");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Limpia errores previos
    setIsLoading(true); // Inicia la carga

    
    try {
      const response = await loginEmpleado({ username, password });
      
      if (!response.rol) {
      throw new Error("Respuesta inválida del servidor");
      }

      const rol = response.rol.toLowerCase();

      if (rol === "admin" || rol === "administrador") {
        localStorage.setItem("usuario", "Administrador"); 
        router.push("/administrador");
      } else if (rol === "cajero") {
        localStorage.setItem("usuario", "Cajero");
        router.push("/cajero");
      } else {
        toast.error("⚠️ Rol no autorizado o desconocido");
      }
    } catch (err: any) {
     
      const errorMessage = err.message || "Credenciales incorrectas o error de conexión.";
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
   
    <div>
      {/* El Menú está fuera del div que centra, por lo que no se verá afectado */}
      <Menu />
      <Toaster position="top-right" />

     
      <main className="login-page min-h-screen flex flex-col items-center justify-center pt-20 px-4">
        
        {/* Tu formulario de login no cambia, ya que está en el lugar correcto */}
        <div className="login-container">
          <h2 className="text-4xl md:text-5xl text-black font-urwclassico mb-8">
            Acceso Personal
          </h2>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Usuario</label>
              <input 
                type="text" 
                id="username" 
                className="form-input"
                placeholder="Ingresa tu usuario"
                value={username} 
                onChange={(e) => setUsuario(e.target.value)} 
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
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>

    
            {error && <p className="error-message text-center font-bold">{error}</p>}

            <button type="submit" className="login-button mt-4" disabled={isLoading}>
           
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
        
            <Link href="/registro">
              <button type="button" className="login-button secondary-button">
                Crear Cuenta
              </button>
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}
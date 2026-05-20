'use client';
import { useRouter } from 'next/navigation';
import { loginCliente } from '@/src/features/auth/api/LoginCliente';
import { logout } from '@/src/features/auth/api/CerrarSesC';
import { useState } from 'react';
import Menu from "@/src/shared/components/Menu.jsx";
import Link from "next/link";
import "@/src/features/auth/styles/loginC.css";
import "@/src/features/auth/styles/menuCliente.css";

export default function LoginClientePage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { isSuccess, message } = await loginCliente({ usuario, password });

      if (!isSuccess) {
        throw new Error('Credenciales incorrectas');
      }

      router.push('/menu');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
    }
  };

  return (
    <div className="login-page">
      <Menu />

      <div className="login-container">
        <h2 className="text-4xl md:text-5xl text-black font-urwclassico mb-8">
          Iniciar Sesión (Cliente)
        </h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input 
              type="text" 
              id="username" 
              className="form-input"
              placeholder="Ingresa tu usuario"
              value={usuario}
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

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Ingresar'}
          </button>

          <Link href="/registro">
            <button type="button" className="login-button">
              Crear Cuenta
            </button>
          </Link>

          <button 
            type="button" 
            className="login-button secondary-button" 
            onClick={(e) =>{
              e.preventDefault();
              router.push('/menu');
              handleLogout();
            }}
          >
            Cerrar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
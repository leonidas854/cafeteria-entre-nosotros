'use client';
import { useRouter } from 'next/navigation';
import { loginCliente } from '@/app/api/LoginCliente';
import { logout } from '@/app/api/CerrarSesC';
import { useState } from 'react';
import Menu from "../components/Menu.jsx";
import Link from "next/link";
import "./loginC.css";
import "../login/menu.css";
import { Finlandica } from 'next/font/google/index.js';

export default function LoginClientePage() {
  const [username, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { tipo, message ,error} = await loginCliente({ username,password});
      //router.push('/menu');
      window.location.href='/menu';
    } catch (err:any) {
      const errorMessage = err?.response?.data?.error || 'Error desconocido';

    if (errorMessage === 'Credenciales inválidas') {
      setError('Credenciales incorrectas'); 
    } else {
      setError(errorMessage); 
    }
    
  } finally {
    setIsLoading(false);
  }
};

  const handleLogout = async () => {
    try {
      await logout();
      //router.push('/LoginClientes'); 
      window.location.href = '/LoginClientes';
  
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
   
  }};

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
              //router.push('/menu');
              handleLogout();
              
            }
              
            
            }
          >
            Cerrar Sesión
          </button>
          

          
          
        </form>
      </div>
    </div>
  );
}
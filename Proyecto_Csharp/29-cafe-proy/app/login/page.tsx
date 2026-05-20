'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Menu from "@/src/shared/components/Menu.jsx";
import { loginEmpleado } from '@/src/features/auth/api/LoginEmpleado';
import toast, { Toaster } from 'react-hot-toast';
import styles from '@/src/features/auth/styles/auth-shared.module.css';
import FormInput from '@/src/features/auth/components/FormInput';

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("auth");
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!usuario.trim()) {
      setError('Ingresa tu usuario');
      return;
    }
    if (!password.trim()) {
      setError('Ingresa tu contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginEmpleado({ usuario: usuario.trim(), password: password.trim() });

      if (!response || !response.isSuccess) {
        setError(response?.message || 'Credenciales incorrectas');
        return;
      }

      const rol = response.rol?.toLowerCase();

      if (rol === "admin" || rol === "administrador") {
        localStorage.setItem("usuario", "Administrador");
        toast.success('¡Bienvenido, Administrador!');
        router.push("/administrador");
      } else if (rol === "cajero") {
        localStorage.setItem("usuario", "Cajero");
        toast.success('¡Bienvenido, Cajero!');
        router.push("/cajero");
      } else {
        setError('Rol no autorizado para este panel');
        toast.error("Rol no autorizado");
      }
    } catch (err: any) {
      const msg = err?.message || 'Error de conexión con el servidor';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.authPage} ${styles.bgLogin}`}>
      <Menu />
      <Toaster position="top-right" />

      <div className={styles.authCard}>
        <img
          src="https://res.cloudinary.com/dmrszrfdx/image/upload/v1763330782/logo_cizy3g.png"
          alt="Logo"
          className={styles.authLogo}
        />
        <h2 className={styles.authTitle}>Panel de Empleados</h2>
        <p className={styles.authSubtitle}>Ingresa tus credenciales para continuar</p>

        {error && (
          <div className={styles.formAlert}>
            <p className={styles.formAlertText}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <FormInput
            id="username"
            name="usuario"
            label="Usuario"
            placeholder="Ingresa tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />

          <FormInput
            id="password"
            name="password"
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />

          <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Verificando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

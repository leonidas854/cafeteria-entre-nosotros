'use client';
import { useRouter } from 'next/navigation';
import { loginCliente } from '@/src/features/auth/api/LoginCliente';
import { useState } from 'react';
import Menu from "@/src/shared/components/Menu.jsx";
import Link from "next/link";
import toast, { Toaster } from 'react-hot-toast';
import styles from '@/src/features/auth/styles/auth-shared.module.css';
import FormInput from '@/src/features/auth/components/FormInput';

export default function LoginClientePage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      const { isSuccess, message } = await loginCliente({ 
        usuario: usuario.trim(), 
        password: password.trim() 
      });

      if (!isSuccess) {
        setError(message || 'Credenciales incorrectas');
        return;
      }

      toast.success('¡Bienvenido!');
      router.push('/menu');
    } catch (err: any) {
      const msg = err?.message || 'Error de conexión';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.authPage} ${styles.bgLoginCliente}`}>
      <Menu />
      <Toaster position="top-right" />

      <div className={styles.authCard}>
        <img
          src="https://res.cloudinary.com/dmrszrfdx/image/upload/v1763330782/logo_cizy3g.png"
          alt="Logo"
          className={styles.authLogo}
        />
        <h2 className={styles.authTitle}>Iniciar Sesión</h2>
        <p className={styles.authSubtitle}>Accede a tu cuenta para hacer pedidos</p>

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

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>¿No tienes cuenta?</span>
            <span className={styles.dividerLine} />
          </div>

          <Link href="/registro" style={{ textDecoration: 'none' }}>
            <button type="button" className={styles.btnSecondary}>
              Crear Cuenta
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
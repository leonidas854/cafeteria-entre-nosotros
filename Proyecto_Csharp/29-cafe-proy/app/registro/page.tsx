'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Menu from '@/src/shared/components/Menu.jsx';
import FormInput from '@/src/features/auth/components/FormInput';
import PasswordStrengthBar from '@/src/features/auth/components/PasswordStrengthBar';
import LocationPicker from '@/src/features/auth/components/LocationPicker';
import { registrarCliente } from '@/src/features/auth/api/RCliente';
import toast, { Toaster } from 'react-hot-toast';
import styles from '@/src/features/auth/styles/auth-shared.module.css';

export default function RegistroCliente() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidopat: '',
    apellidomat: '',
    telefono: '',
    nit: '',
    usuario: '',
    password: '',
  });
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellidopat.trim()) newErrors.apellidopat = 'El apellido paterno es requerido';
    if (!formData.apellidomat.trim()) newErrors.apellidomat = 'El apellido materno es requerido';
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{7,8}$/.test(formData.telefono.trim())) {
      newErrors.telefono = 'El teléfono debe tener 7-8 dígitos';
    }

    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El nombre de usuario es requerido';
    } else if (formData.usuario.trim().length < 3) {
      newErrors.usuario = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(formData.password)) {
      newErrors.password = 'Debe contener letras y números';
    }

    if (latitud === null || longitud === null) {
      newErrors.ubicacion = 'Debes seleccionar una ubicación en el mapa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Corrige los errores del formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registrarCliente({
        nombre: formData.nombre.trim(),
        apell_paterno: formData.apellidopat.trim(),
        apell_materno: formData.apellidomat.trim(),
        telefono: Number(formData.telefono),
        NIT: Number(formData.nit) || 0,
        latitud: latitud!,
        longitud: longitud!,
        usuario: formData.usuario.trim(),
        password: formData.password,
        ubicacion: 'Coordenadas desde mapa',
      });

      if (result.isSuccess) {
        router.push('/LoginClientes');
      } else {
        setErrors((prev) => ({ ...prev, form: result.message }));
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        form: err?.message || 'Error de conexión con el servidor',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Definición de campos del formulario
  const fields = [
    { id: 'nombre', label: 'Nombre', placeholder: 'Tu nombre', required: true, icon: userIcon },
    { id: 'apellidopat', label: 'Apellido Paterno', placeholder: 'Apellido paterno', required: true, icon: userIcon },
    { id: 'apellidomat', label: 'Apellido Materno', placeholder: 'Apellido materno', required: true, icon: userIcon },
    { id: 'telefono', label: 'Teléfono', placeholder: '7XXXXXXX', required: true, icon: phoneIcon },
    { id: 'nit', label: 'NIT', placeholder: 'NIT (opcional)', required: false, icon: docIcon },
    { id: 'usuario', label: 'Nombre de Usuario', placeholder: 'Elige un usuario', required: true, icon: atIcon },
  ];

  return (
    <div className={`${styles.authPage} ${styles.bgRegistro}`}>
      <Menu />
      <Toaster position="top-right" />

      <div className={`${styles.authCard} ${styles.authCardWide}`}>
        <img
          src="https://res.cloudinary.com/dmrszrfdx/image/upload/v1763330782/logo_cizy3g.png"
          alt="Logo"
          className={styles.authLogo}
        />
        <h2 className={styles.authTitle}>Registro de Cliente</h2>
        <p className={styles.authSubtitle}>Crea tu cuenta para realizar pedidos online</p>

        {errors.form && (
          <div className={styles.formAlert}>
            <p className={styles.formAlertText}>{errors.form}</p>
          </div>
        )}

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {fields.map((field) => (
              <FormInput
                key={field.id}
                id={field.id}
                name={field.id}
                label={field.label}
                placeholder={field.placeholder}
                value={formData[field.id as keyof typeof formData]}
                onChange={handleChange}
                error={errors[field.id]}
                required={field.required}
                icon={field.icon}
              />
            ))}

            {/* Password con barra de fortaleza */}
            <FormInput
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              helperText="Debe contener letras y números"
              icon={lockIcon}
            >
              <PasswordStrengthBar password={formData.password} />
            </FormInput>
          </div>

          {/* Mapa OpenStreetMap */}
          <div className={styles.formGridFullWidth}>
            <LocationPicker
              lat={latitud}
              lng={longitud}
              onLocationChange={(lat, lng) => {
                setLatitud(lat);
                setLongitud(lng);
                if (errors.ubicacion) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.ubicacion;
                    return next;
                  });
                }
              }}
              error={errors.ubicacion}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className={styles.btnAccent}>
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                Registrando...
              </>
            ) : (
              'Registrarse'
            )}
          </button>

          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>¿Ya tienes una cuenta?</span>
            <span className={styles.dividerLine} />
          </div>

          <Link href="/LoginClientes" style={{ textDecoration: 'none' }}>
            <button type="button" className={styles.btnSecondary}>
              Iniciar Sesión
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}

// ---- SVG Icons (inline, sin dependencias externas) ----
const userIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const phoneIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const docIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const atIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </svg>
);

const lockIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
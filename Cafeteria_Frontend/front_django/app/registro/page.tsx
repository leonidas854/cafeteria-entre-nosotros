'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './RegistroCliente.module.css';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px'
};

const defaultCenter = {
  lat: -17.7833,
  lng: -63.1821
};

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
    latitud: null as number | null,
    longitud: null as number | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellidopat.trim()) newErrors.apellidopat = 'El apellido paterno es requerido';
    if (!formData.apellidomat.trim()) newErrors.apellidomat = 'El apellido materno es requerido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';

    if (!formData.usuario.trim() || formData.usuario.trim().split(' ').length < 1) {
      newErrors.usuario = 'El usuario debe contener al menos una palabra';
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!formData.password || !passwordRegex.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener letras y números';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.latitud === null || formData.longitud === null) {
      newErrors.ubicacion = 'Debes seleccionar una ubicación en el mapa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/Acceso/Registrarse_Cliente`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: formData.nombre,
    apell_paterno: formData.apellidopat,
    apell_materno: formData.apellidomat,
    telefono: Number(formData.telefono),
    NIT: Number(formData.nit),
    latitud: formData.latitud,
    longitud: formData.longitud,
    usuario: formData.usuario,
    password: formData.password,
    ubicacion: "Coordenadas desde mapa" 
  })
});


      const result = await response.json();

      if (response.ok && result.isSuccess) {
        router.push('/menu');
      } else {
        setErrors(prev => ({ ...prev, form: result.mensaje || 'Error en el registro' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, form: 'Error de conexión con el servidor' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Registro de Nuevo Cliente</h2>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formWrapper}>
          {errors.form && <div className={styles.errorAlert}><p className={styles.errorText}>{errors.form}</p></div>}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.gridContainer}>
              {['nombre', 'apellidopat', 'apellidomat', 'telefono', 'nit', 'usuario', 'password'].map((field) => (
                <div key={field} className={styles.inputGroup}>
                  <label htmlFor={field} className={styles.label}>
                    {field === 'usuario' ? 'Nombre de Usuario *' : field === 'password' ? 'Contraseña *' : `${field.charAt(0).toUpperCase() + field.slice(1)} ${field !== 'nit' ? '*' : '(opcional)'}`}
                  </label>
                  <div className={styles.inputContainer}>
                    <input
                      type={field === 'password' ? 'password' : 'text'}
                      id={field}
                      name={field}
                      value={formData[field as keyof typeof formData] as string}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-md border bg-gray-800 text-gray-100 border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors[field] ? 'border-red-500' : ''}`}

                    />
                    {errors[field] && <p className={styles.errorTextInput}>{errors[field]}</p>}
                    {field === 'password' && <p className={styles.helperText}>Debe contener letras y números</p>}
                  </div>
                </div>
              ))}

              {/* Mapa para seleccionar ubicación */}
              <div className={styles.fullWidthInputGroup}>
                <label className={styles.label}>Selecciona tu ubicación en el mapa *</label>
                {isLoaded && (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={formData.latitud && formData.longitud ? { lat: formData.latitud, lng: formData.longitud } : defaultCenter}
                    zoom={14}
                    onClick={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitud: e.latLng?.lat() || null,
                        longitud: e.latLng?.lng() || null
                      }));
                    }}
                  >
                    {formData.latitud && formData.longitud && (
                      <Marker position={{ lat: formData.latitud, lng: formData.longitud }} />
                    )}
                  </GoogleMap>
                )}
                {errors.ubicacion && <p className={styles.errorTextInput}>{errors.ubicacion}</p>}
              </div>
            </div>

            <div>
              <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>

          <div className={styles.loginContainer}>
            <div className={styles.dividerContainer}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>¿Ya tienes una cuenta?</span>
            </div>
            <div className={styles.loginButtonContainer}>
              <Link href="/LoginClientes">
                <button type="button" className={styles.loginButton}>
                  Iniciar Sesión
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
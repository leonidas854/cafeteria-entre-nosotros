import toast from 'react-hot-toast';
import { apiClient } from '@/src/shared/api/apiClient';

export interface LoginEmpleadoRequest {
  usuario: string;
  password: string;
}

export interface LoginEmpleadoResponse {
  isSuccess: boolean;
  rol?: string;
  token?: string;
  message?: string;
}

export interface EmpleadoRegistroRequest {
  nombre: string;
  apell_paterno: string;
  apell_materno: string;
  telefono: number;
  usuario: string;
  password: string;
  Empleado_rol: string;
}

export interface UsuarioAutenticado {
  rol: string;
  fechaContrato: string;
  ventas: any[] | null;
  id_user: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: number;
  usuari: string;
  password: string; 
}

export const getUsuarioAutenticado = async (): Promise<UsuarioAutenticado> => {
  try {
    const data = await apiClient.get('/Acceso/Datos');
    return data as unknown as UsuarioAutenticado;
  } catch (error: any) {
    toast.error('No autenticado: ' + (error?.message || 'Error desconocido'));
    throw new Error('No autenticado');
  }
};

export const loginEmpleado = async (
  credenciales: LoginEmpleadoRequest
): Promise<LoginEmpleadoResponse> => {
  try {
    const data = await apiClient.post('/Acceso/Login_Empleado', credenciales);
    return data as unknown as LoginEmpleadoResponse;
  } catch (error: any) {
    console.error("Error en loginEmpleado:", error);
    toast.error(error.message || '❌ Error de red o del servidor al iniciar sesión');
    return {
      isSuccess: false,
      message: error.message || 'Error al procesar la solicitud',
    };
  }
};

export const registrarEmpleado = async (empleado: EmpleadoRegistroRequest): Promise<{ isSuccess: boolean; mensaje?: string }> => {
  try {
    const data = await apiClient.post('/Acceso/Registrar_Empleado', empleado);
    toast.success('✅ Empleado registrado correctamente');
    return { isSuccess: true };
  } catch (error: any) {
    toast.error(error.message || '❌ Error al registrar el empleado');
    return { isSuccess: false, mensaje: error.message };
  }
};

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/Acceso/Login_Empleado`;
const API_URL2 = `${process.env.NEXT_PUBLIC_BACKEND_URL}/Acceso/Datos`;
export interface LoginEmpleadoRequest {
  usuario: string;
  password: string;
}

export interface LoginEmpleadoResponse {
  isSuccess: boolean;
  rol?: string;
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
    const response = await axios.get<UsuarioAutenticado>(API_URL2, {
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    toast.error('No autenticado:', error?.response?.status);
    throw new Error('No autenticado');
  }
};

export const loginEmpleado = async (
  credenciales: LoginEmpleadoRequest
): Promise<LoginEmpleadoResponse> => {
  try {
    const response = await axios.post<LoginEmpleadoResponse>(
      API_URL,
      credenciales,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );

    const data = response.data;

    if (!data.isSuccess) {
      toast.error(data.message || '❌ Credenciales inválidas');
    }

    return data;
  } catch (error: any) {
    console.error("Error en loginEmpleado:", error);

    toast.error(
      error.response?.data?.message ||
      '❌ Error de red o del servidor al iniciar sesión'
    );

    return {
      isSuccess: false,
      message: 'Error al procesar la solicitud',
    };
  }
};

const API_URL_REGISTRO = `${process.env.NEXT_PUBLIC_BACKEND_URL}/Acceso/Registrar_Empleado`;

export const registrarEmpleado = async (empleado: EmpleadoRegistroRequest): Promise<{ isSuccess: boolean; mensaje?: string }> => {
  try {
    const response = await axios.post(API_URL_REGISTRO, empleado, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    if (response.status === 200 && response.data.isSuccess) {
      toast.success('✅ Empleado registrado correctamente');
      return { isSuccess: true };
    } else {
      toast.error('❌ No se pudo registrar el empleado');
      return { isSuccess: false };
    }
  } catch (error: any) {
    if (error.response?.status === 409) {
      toast.error(error.response?.data?.mensaje || '❌ El usuario ya existe');
    } else {
      toast.error('❌ Error al registrar el empleado');
    }

    return { isSuccess: false, mensaje: error.response?.data?.mensaje };
  }
};

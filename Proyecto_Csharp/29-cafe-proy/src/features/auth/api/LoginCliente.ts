import { apiClient } from '@/src/shared/api/apiClient';
import toast from 'react-hot-toast';

export interface LoginClienteRequest {
  usuario: string;
  password: string;
}

export interface LoginClienteResponse {
  isSuccess: boolean;
  message?: string;
  token?: string;
}

/**
 * Login de clientes usando el apiClient centralizado.
 * Guarda el nombre del cliente en sessionStorage si tiene éxito.
 */
export const loginCliente = async (
  credenciales: LoginClienteRequest
): Promise<LoginClienteResponse> => {
  try {
    const response = await apiClient.post('/Acceso/Login', credenciales, {
      withCredentials: true,
    });

    // apiClient interceptor extrae .data, así que response.data ya es el payload
    const data = response.data ?? response;

    if (data?.isSuccess || data === true) {
      sessionStorage.setItem('nombreCliente', credenciales.usuario);
      return { isSuccess: true, message: 'Login exitoso' };
    }

    // Respuesta controlada pero no exitosa
    const msg = data?.message || 'Credenciales incorrectas';
    toast.error(msg);
    return { isSuccess: false, message: msg };
  } catch (error: any) {
    const msg = error?.message || 'Error de conexión al iniciar sesión';
    toast.error(msg);
    return { isSuccess: false, message: msg };
  }
};

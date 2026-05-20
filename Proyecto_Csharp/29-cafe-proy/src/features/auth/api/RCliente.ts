import { apiClient } from '@/src/shared/api/apiClient';
import toast from 'react-hot-toast';

export interface ClienteRequest {
  nombre: string;
  apell_paterno: string;
  apell_materno: string;
  telefono: number;
  NIT: number;
  ubicacion: string;
  latitud: number;
  longitud: number;
  usuario: string;
  password: string;
}

export interface ClienteResponse {
  isSuccess: boolean;
  message: string;
  mensaje?: string;
}

/**
 * Registrar un nuevo cliente usando el apiClient centralizado.
 * Ya no tiene URL hardcodeada - usa la variable de entorno configurada en apiClient.
 */
export const registrarCliente = async (
  clienteData: ClienteRequest
): Promise<ClienteResponse> => {
  try {
    const response = await apiClient.post('/Acceso/Registrarse_cliente', clienteData, {
      withCredentials: true,
    });

    const data = response.data ?? response;

    if (data?.isSuccess || data === true) {
      toast.success('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
      return { isSuccess: true, message: 'Registro exitoso' };
    }

    const msg = data?.message || data?.mensaje || 'Error en el registro';
    toast.error(msg);
    return { isSuccess: false, message: msg };
  } catch (error: any) {
    const msg = error?.message || 'Error de conexión al registrar';
    toast.error(msg);
    return { isSuccess: false, message: msg };
  }
};

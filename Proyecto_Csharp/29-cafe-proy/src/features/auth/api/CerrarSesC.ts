import { apiClient } from '@/src/shared/api/apiClient';
import toast from 'react-hot-toast';

export interface LogoutResponse {
  isSuccess: boolean;
  message?: string;
}

/**
 * Cerrar sesión del cliente.
 * Limpia sessionStorage, localStorage y cookies.
 */
export const logout = async (): Promise<LogoutResponse> => {
  try {
    await apiClient.post('/Acceso/Logout', {}, {
      withCredentials: true,
    });

    // Limpiar almacenamiento local
    sessionStorage.removeItem('nombreCliente');
    document.cookie = 'token=; Max-Age=0; path=/;';
    localStorage.clear();
    sessionStorage.clear();

    return { isSuccess: true, message: 'Sesión cerrada' };
  } catch (error: any) {
    // Limpiar de todas formas aunque falle el backend
    sessionStorage.removeItem('nombreCliente');
    document.cookie = 'token=; Max-Age=0; path=/;';
    localStorage.clear();
    sessionStorage.clear();

    const msg = error?.message || 'Error al cerrar sesión';
    toast.error(msg);
    return { isSuccess: false, message: msg };
  }
};

const API_LOGOUT_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/Acceso/Logout`;

export interface LogoutResponse {
  isSuccess: boolean;
  message?: string;
}

export const logout = async (): Promise<LogoutResponse> => {
  try {
    const response = await fetch(API_LOGOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    sessionStorage.removeItem('nombreCliente');
    
    document.cookie = 'token=; Max-Age=0; path=/;';
    localStorage.clear();
    sessionStorage.clear();

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const data = await response.json();
    return data;
  } catch (err) {
    throw new Error('Error al cerrar sesión');
  }
};
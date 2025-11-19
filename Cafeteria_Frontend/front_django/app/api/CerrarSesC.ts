const API_LOGOUT_URL = process.env.NEXT_PUBLIC_API + "/api/logout/";

export interface LogoutResponse {
  isSuccess: boolean;
  message?: string;
}

const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') {
    return null; 
  }
  const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
};


export const logout = async (): Promise<LogoutResponse> => {
  const csrfToken = getCsrfToken();

  if (!csrfToken) {

    throw new Error("No se encontró el token CSRF para el logout.");
  }

  try {
    const response = await fetch(API_LOGOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      credentials: 'include',
    });

    if (!response.ok) {

      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error en la respuesta del servidor');
    }

    sessionStorage.removeItem('nombreCliente');
    localStorage.clear();
    sessionStorage.clear();

    const data = await response.json();
    return data;

  } catch (err) {

    throw err;
  }
};
const BASE_URL = 'http://localhost:5054/api/Acceso';

export interface ClienteRequest {
  nombre: string;
  apell_paterno: string;
  apell_materno: string;
  telefono: number;
  nit: number;
  ubicacion: string;
  latitud: number;
  longitud: number;
  usuario: string;
  password: string;
}

export interface ClienteResponse {
  isSuccess: boolean;
  message: string;
}

// FUNCIÓN PARA REGISTRAR CLIENTE
export const registrarCliente = async (
  clienteData: ClienteRequest
): Promise<ClienteResponse> => {
  const response = await fetch(`${BASE_URL}/Registrarse_cliente`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // ← para enviar cookies
    body: JSON.stringify(clienteData),
  });

  const data: ClienteResponse = await response.json();

  if (!response.ok || !data.isSuccess) {
    throw new Error(data.message || `Error ${response.status}`);
  }

  return data;
};

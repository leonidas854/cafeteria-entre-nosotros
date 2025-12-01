import axios from 'axios';

const API_URL_ = `${process.env.NEXT_PUBLIC_API}/api/cajero`;

export interface UsuarioNit {
  id: number;
  apell_paterno: string;
  nit: number;
  usuario: string;
  password: string;
}

const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
};

export interface RegistroClienteResponse {
  isSuccess: boolean;
  cliente: UsuarioNit;
}

export const buscarClientePorNIT = async (nit: string): Promise<UsuarioNit> => {
  const csrfToken = getCsrfToken();
  if (!csrfToken) {
    throw new Error("Token CSRF no encontrado.");
  }
  const response = await axios.get(`${API_URL_}/nit/${nit}/`, {
    withCredentials: true,
    headers: { 'X-CSRFToken': csrfToken },
  });
  return response.data;
};

export const buscarClientePorId = async (id: number): Promise<UsuarioNit> => {
  const csrfToken = getCsrfToken();
  if (!csrfToken) {
    throw new Error("Token CSRF no encontrado.");
  }
  const response = await axios.get(`${API_URL_}/cliente/${id}`, {
    withCredentials: true,
      headers: { 'X-CSRFToken': csrfToken },
  });
  return response.data;
};

export const registrarClienteManual = async (
  apellidoPaterno: string,
  nit: string,
  sinNit = false
): Promise<UsuarioNit> => {
  const payload = {
    apell_paterno: apellidoPaterno,
    NIT: sinNit ? 7777777 : Number(nit),
    usuario: `${apellidoPaterno}_${Date.now()}`,
    password: '12345',
  };
const csrfToken = getCsrfToken();
  if (!csrfToken) {
    throw new Error("Token CSRF no encontrado.");
  }
  const response = await axios.post<RegistroClienteResponse>(
    `${API_URL_}/Registrar-cliente/`,
    payload,
    { withCredentials: true,  headers: { 'X-CSRFToken': csrfToken }, }
  );


  return response.data.cliente;
};


export const actualizarApellidoPorNIT = async (
  nit: number,
  nuevoApellido: string
): Promise<UsuarioNit> => {

  const csrfToken = getCsrfToken();
  if (!csrfToken) {
    throw new Error("Token CSRF no encontrado.");
  }

  const body = {
    nuevo_apellido: nuevoApellido
  };

  const response = await axios.put(
    `${API_URL_}/actualizar-apellido/${nit}/`,
    body, 
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      withCredentials: true,
    }
  );


  return response.data.cliente;
};
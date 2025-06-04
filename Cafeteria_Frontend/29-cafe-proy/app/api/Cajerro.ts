import axios from 'axios';

const API_URL_ = `${process.env.NEXT_PUBLIC_API_URL}/Cajero`;

export interface UsuarioNit {
  id: number;
  apell_paterno: string;
  NIT: number;
  usuario: string;
  password: string;
}

export interface RegistroClienteResponse {
  isSuccess: boolean;
  cliente: UsuarioNit;
}

export const buscarClientePorNIT = async (nit: string): Promise<UsuarioNit> => {
  const response = await axios.get(`${API_URL_}/nit/${nit}`, {
    withCredentials: true,
  });
  return response.data;
};

export const buscarClientePorId = async (id: number): Promise<UsuarioNit> => {
  const response = await axios.get(`${API_URL_}/cliente/${id}`, {
    withCredentials: true,
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
    password: '123456',
  };

  const response = await axios.post<RegistroClienteResponse>(
    `${API_URL_}/Registrar`,
    payload,
    { withCredentials: true }
  );


  return response.data.cliente;
};

const API_URL_ = process.env.NEXT_PUBLIC_API+"/api/login/";
//`${process.env.NEXT_PUBLIC_BACKEND_URL}/Acceso/Login`;

export interface LoginClienteRequest {
  username: string;
  password: string;
}
// Respuesta del servidor

export interface LoginClienteResponse {
  message?: string;
  tipo?: string;
 error?: string;
}

export const loginCliente = async (
  credenciales: LoginClienteRequest
): Promise<LoginClienteResponse> => {
  const response = await fetch(API_URL_, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(credenciales),
});

const text = await response.text(); 

if (!text) {
  throw new Error("Respuesta vacía del servidor");
}

let data;
try {
  data = JSON.parse(text);
} catch {
  throw new Error("La respuesta del servidor no es un JSON válido");
}


if (data.tipo == "cliente") {
    sessionStorage.setItem('nombreCliente', credenciales.username);
  }

return data;

};

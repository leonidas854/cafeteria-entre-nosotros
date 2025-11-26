const BASE_URL = 'http://localhost:5054/api/Usuarios';

interface Empleado {
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

// PARA OBTENER TODOS LOS EMPLEADOS
export const getEmpleados = async (): Promise<Empleado[]> => {
  const response = await fetch(`${BASE_URL}/Empleados`, {
    credentials: 'include' // ← usamos la cookie
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }

  return await response.json();
};

// PARA ACTUALIZAR UN EMPLEADO
export const actualizarEmpleado = async (
  usuarioActual: string,
  empleadoData: Partial<Empleado>
): Promise<Empleado> => {
  const response = await fetch(`${BASE_URL}/empleado/usuario/${encodeURIComponent(usuarioActual)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify(empleadoData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Error ${response.status}`);
  }

  return await response.json();
};

// PARA ELIMINAR UN EMPLEADO
export const eliminarEmpleado = async (
  usuario: string
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/empleado/usuario`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({ usuario })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Error ${response.status}`);
  }
};

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Error ${response.status}`);
  }
  return response;
};

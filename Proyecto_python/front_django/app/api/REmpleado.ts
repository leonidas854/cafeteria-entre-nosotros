const BASE_URL = 'http://localhost:5054/api/Acceso';

export interface REmpleado {
  nombre: string;
  apell_paterno: string;
  apell_materno: string;
  telefono: number;
  usuario: string;
  password: string;
  fecha_contrato: string;       
  empleado_rol: string;
}

export const registrarEmpleado = async (empleado: REmpleado) => {
  const response = await fetch(`${BASE_URL}/Registrar_Empleado`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // ← importante para que se envíe la cookie
    body: JSON.stringify(empleado)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Error ${response.status}`);
  }

  return await response.json();
};

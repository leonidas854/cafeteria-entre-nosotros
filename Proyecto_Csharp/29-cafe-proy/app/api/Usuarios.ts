import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/Usuarios`,
  withCredentials: true, // ✅ clave para manejar cookies/sesiones
});





// 1. Obtener clientes
export const getClientes = async () => {
  try {
    const res = await api.get('/Clientes');
    return res.data;
  } catch (error: any) {
    toast.error('Error al obtener clientes');
    throw error;
  }
};

// 2. Obtener empleados
export const getEmpleados = async () => {
  try {
    const res = await api.get('/Empleados');
    return res.data;
  } catch (error: any) {
    toast.error('Error al obtener empleados');
    throw error;
  }
};

// 3. Actualizar cliente
export const actualizarCliente = async (usuarioActual: string, cliente: any) => {
  try {
    await api.put(`/cliente/usuario/${usuarioActual}`, cliente, {
      withCredentials: true,
    });
    toast.success('Cliente actualizado correctamente');
  } catch (error: any) {
    if (error.response?.status === 409) {
      toast.error('Ya existe un cliente con ese nombre de usuario');
    } else {
      toast.error('Error al actualizar cliente');
    }
    throw error;
  }
};

// 4. Actualizar empleado
export const actualizarEmpleado = async (usuarioActual: string, empleado: any) => {
  try {
    await api.put(`/empleado/usuario/${usuarioActual}`, empleado, {
      withCredentials: true,
    });
    toast.success('Empleado actualizado correctamente');
  } catch (error: any) {
    if (error.response?.status === 409) {
      toast.error('Ya existe un empleado con ese nombre de usuario');
    } else {
      toast.error('Error al actualizar empleado');
    }
    throw error;
  }
};

// 5. Eliminar cliente
// 5. Eliminar cliente (solo usuario)
export const eliminarCliente = async (usuario: string) => {
  try {
    await api.delete('/cliente/usuario', {
      data: {usuario}, // string directo
      withCredentials: true,
    });
    toast.success('Cliente eliminado exitosamente');
  } catch (error: any) {
    if (error.response?.status === 404) {
      toast.error('Cliente no encontrado');
    } else {
      toast.error('Error al eliminar cliente');
    }
    throw error;
  }
};

// 6. Eliminar empleado (solo usuario)
export const eliminarEmpleado = async (usuario: string) => {
  try {
    await api.delete('/empleado/usuario', {
      data: {usuario},
      withCredentials: true,
    });
    toast.success('Empleado eliminado exitosamente');
  } catch (error: any) {
    if (error.response?.status === 404) {
      toast.error('Empleado no encontrado');
    } else {
      toast.error('Error al eliminar empleado');
    }
    throw error;
  }
};


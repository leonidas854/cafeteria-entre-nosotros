import { apiClient } from '@/src/shared/api/apiClient';
import { toast } from 'react-hot-toast';

// 1. Obtener clientes
export const getClientes = async () => {
  try {
    const res = await apiClient.get('/Usuarios/Clientes', { withCredentials: true });
    return res.data;
  } catch (error: any) {
    toast.error('Error al obtener clientes');
    throw error;
  }
};

// 2. Obtener empleados
export const getEmpleados = async () => {
  try {
    const res = await apiClient.get('/Usuarios/Empleados', { withCredentials: true });
    return res.data;
  } catch (error: any) {
    toast.error('Error al obtener empleados');
    throw error;
  }
};

// 3. Actualizar cliente
export const actualizarCliente = async (usuarioActual: string, cliente: any) => {
  try {
    await apiClient.put(`/Usuarios/cliente/usuario/${usuarioActual}`, cliente, {
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
    await apiClient.put(`/Usuarios/empleado/usuario/${usuarioActual}`, empleado, {
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
    await apiClient.delete('/Usuarios/cliente/usuario', {
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
    await apiClient.delete('/Usuarios/empleado/usuario', {
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


import axios from 'axios';

const API_URL = `${process.env.NEXT_PUBLIC_API}/api/carrito`;


const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
};

export interface Extra {
  id: number;
  name: string;
  precio: number;
}

export interface ItemCarrito {
  id: number; 
  producto_id: number;
  nombre: string;
  categoria: string;
  precio_unitario: number;
  cantidad: number;
  extras: Extra[];
  tiene_promocion: boolean;
  precio_promocional?: number;
  descripcion_promocion?: string;
}

export interface Carrito {
  id: number;
  cliente_id?: number;
  empleado_id?: number;
  items: ItemCarrito[];
}


export async function obtenerCarrito(): Promise<Carrito | null> {
  try {

    const response = await axios.get<Carrito>(`${API_URL}/mi-carrito/`, {
      withCredentials: true 
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404 || error.response?.status === 401) {
      console.warn('No se encontró un carrito para el usuario o no está autorizado.');
      return null;
    }
    console.error('Error al obtener el carrito:', error);
    throw error;
  }
}

export async function agregarProductoAlCarrito(
  productoId: number,
  cantidad: number,
  extraIds: number[] = [] 
): Promise<Carrito> {

 const csrfToken = getCsrfToken();
  if (!csrfToken) {
    throw new Error("Token CSRF no encontrado. No se puede agregar al carrito.");
  }

  try {
    const body = {
      producto_id: productoId,
      cantidad: cantidad,
      extra_ids: extraIds
    };


    const response = await axios.post<Carrito>(`${API_URL}/agregar-item/`, body, {
      withCredentials: true,
      headers:{
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken, 
      }

    });
    return response.data;
  } catch (error: any) {
    console.error('Error al agregar producto al carrito:', error);
    throw error;
  }
}


export async function modificarCantidad(
  itemId: number, 
  nuevaCantidad: number
): Promise<Carrito> {


  const csrfToken = getCsrfToken();
  if (!csrfToken) {
    throw new Error("Token CSRF no encontrado.");
  }
  try {
    const body = {
      item_id: itemId,
      nueva_cantidad: nuevaCantidad
    };

    const response = await axios.put<Carrito>(`${API_URL}/modificar-cantidad/`, body, {
      withCredentials: true,
      headers: { 'X-CSRFToken': csrfToken },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al modificar cantidad:', error);
    throw error;
  }
}


export async function modificarExtras(
  itemId: number, 
  nuevosExtraIds: number[]
): Promise<Carrito> {
  try {
    const body = {
      item_id: itemId,
      nuevos_extra_ids: nuevosExtraIds
    };
    const response = await axios.put<Carrito>(`${API_URL}/modificar-extras/`, body, {
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al modificar extras del producto:', error);
    throw error;
  }
}

export async function quitarProducto(
  itemId: number 
): Promise<Carrito> {
  try {

    const response = await axios.delete<Carrito>(`${API_URL}/quitar-item/${itemId}/`, {
      withCredentials: true
    });
    return response.data;
  } catch (error: any) {
    console.error('Error al quitar producto del carrito:', error);
    throw error;
  }
}

export async function eliminarCarrito(): Promise<void> {
  try {
    await axios.delete(`${API_URL}/vaciar-carrito/`, {
      withCredentials: true,
    });
  } catch (error: any) {
    console.error("Error al eliminar el carrito:", error);
    throw error;
  }
}

export async function asignarCarritoACliente(
  carritoId: number, 
  clienteId: number
): Promise<Carrito> {
  try {
    const body = { cliente_id: clienteId };
    
    const response = await axios.put<Carrito>(`${API_URL}/${carritoId}/asignar-cliente/`, body, { 
      withCredentials: true 
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al asignar el carrito al cliente:", error);
    throw error;
  }
}
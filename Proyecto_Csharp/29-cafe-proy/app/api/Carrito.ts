
import axios from 'axios';

const API_URL_ = `${process.env.NEXT_PUBLIC_API_URL}/Carrito`;

export async function agregarProductoAlCarrito(
  productoId: number,
  nombre: string,
  categoria:string,
  precioUnitario: number,
  cantidad = 1,
  extras: { extraId: number; nombre: string; precio: number }[] = [],
  clienteId?: number
)
 {
  try {
    const item = {
      productoId,
      nombre,
      categoria,
      precioUnitario,
      cantidad,
      extras
    };

    const body: any = {
      items: [item]
    };

  if (clienteId) {
      body.clienteId = clienteId;
    }


    const response = await axios.post(`${API_URL_}/agregar`, body, {
  withCredentials: true
});

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('No autorizado: el usuario debe iniciar sesión para agregar productos al carrito.');
      return null;
    }

    console.error('Error al agregar producto al carrito:', error);
    throw error;
  }
}

export async function modificarCantidad(productoId: number, extraIds: number[], nuevaCantidad: number) {
  try {
    const response = await axios.put(
  `${API_URL_}/modificar-cantidad`,
  {
    productoId,
    extraIds,
    nuevaCantidad
  },
  {
    withCredentials: true
  }
);

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('No autorizado: el usuario debe iniciar sesión para modificar la cantidad.');
      return null;
    }

    console.error('Error al modificar cantidad:', error);
    throw error;
  }
}

export async function obtenerCarrito() {
  try {
    const response = await axios.get(API_URL_, {
      withCredentials: true
    });

    const data = response.data;

    // Verifica si hay carrito válido y con items
    if (!data || !Array.isArray(data.items)) {
      return null; 
    }

    return {
      id: data.id,
      clienteId: data.clienteId,
      items: data.items
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('No autorizado: el usuario debe iniciar sesión para obtener el carrito.');
      return { error: 'NO_AUTORIZADO' };
    }

    if (error.response?.status === 404 || error.message.includes('Network')) {
      console.warn('Carrito no encontrado. Se devolverá null.');
      return null;
    }

    console.error('Error al obtener el carrito:', error);
    throw error;
  }
}


export async function modificarExtras(
  productoId: number,
  nuevosExtras: { extraId: number; nombre: string; precio: number }[]
) {
  try {
    const response = await axios.put(`${API_URL_}/modificar-extras`, {
      productoId,
      nuevosExtras
    }, {
      withCredentials: true
    });

    return response.data;
  } catch (error:any) {
    
    if (error.response?.status === 401) {
      console.warn('No autorizado: el usuario debe iniciar sesión para modificar los extras.');
      return null;
    }
    console.error('Error al modificar extras del producto:', error);
    throw error;
  }
}
export async function quitarProducto(
  productoId: number,
  extraIds: number[]
) {
  try {
    const response = await axios.delete(`${API_URL_}/quitar-producto`, {
      data: {
        productoId,
        extraIds
      },
      withCredentials: true
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('No autorizado para quitar productos.');
      return null;
    }

    console.error('Error al quitar producto del carrito:', error);
    throw error;
  }
}

export async function eliminarCarrito(id: string) {
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/Carrito/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error al eliminar el carrito:", error);
    throw error;
  }
}

export async function asignarCarritoACliente(carritoId: string, clienteId: number) {
  try {
    const response = await axios.put(
      `${API_URL_}/asignar-a-cliente/${carritoId}?clienteId=${clienteId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al asignar el carrito al cliente:", error);
    throw error;
  }
}






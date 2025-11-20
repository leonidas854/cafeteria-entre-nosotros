import axios from 'axios';

// Configuración base
const API_URL = process.env.NEXT_PUBLIC_API+"/api/productos/";

const BASE_BACKEND_URL = process.env.NEXT_PUBLIC_API+"/api/productos/";

//process.env.NEXT_PUBLIC_BACKEND_URL;

// Interfaz
export interface Producto {
  id: number;
  tipo: string;
  categoria: string;
  subcategoria: string;
  descripcion: string;
  nombre: string;
  precio: number;
  estado: boolean;
  sabores: string;
  proporcion?: string;
  tamanio?: string;
  imagen_url?: File | string;
}

// 1. Obtener todos los productos activos
export const getProductos = async (): Promise<Producto[]> => {
  try {
    const { data } = await axios.get<Producto[]>(API_URL);

    return data;
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    throw new Error("Error al cargar los productos");
  }
};

// 2. Obtener producto por ID
export const getProductoPorId = async (id: number): Promise<Producto> => {
  try {
    const { data } = await axios.get<Producto>(`${API_URL}${id}/`);
    // Simplemente devuelve los datos, sin manipular la URL.
    return data;
  } catch (error) {
    console.error(`Error al obtener el producto con ID ${id}:`, error);
    throw new Error("Producto no encontrado");
  }
};

// 3. Crear un producto
export const crearProducto = async (producto: Producto) => {
  const formData = new FormData();

  Object.entries(producto).forEach(([key, value]) => {
    if (key === 'image_url' && value instanceof File) {
      formData.append('imagen', value); 
    } else if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  try {
    const { data } = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });
    return data;
  } catch (error: any) {
    console.error("Error al crear el producto:", error);
    throw new Error(error.response?.data || "Error al crear el producto");
  }
};

// 4. Actualizar producto por nombre
export const actualizarProducto = async (nombre: string, producto: Producto) => {
  const formData = new FormData();

  Object.entries(producto).forEach(([key, value]) => {
    if (key === 'image_url' && value instanceof File) {
      formData.append('imagen', value); 
    } else if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  try {
    await axios.put(`${API_URL}/nombre/${encodeURIComponent(nombre)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });
  } catch (error: any) {
    console.error("Error al actualizar el producto:", error);
    throw new Error(error.response?.data || "Error al actualizar el producto");
  }
};

// 5. Eliminar producto por nombre
export const eliminarProducto = async (nombre: string) => {
  try {
    await axios.delete(`${API_URL}/nombre/${encodeURIComponent(nombre)}`, {
      withCredentials: true
    });
  } catch (error: any) {
    console.error("Error al eliminar el producto:", error);
    throw new Error(error.response?.data || "Error al eliminar el producto");
  }
};
//todos los productos
export const getTodosProductos = async (): Promise<Producto[]> => {
  try {
    const { data } = await axios.get<Producto[]>(`${API_URL}/TodosProductos`);

    return data.map((producto) => ({
      ...producto,
      image_url: producto.imagen_url
        ? `${BASE_BACKEND_URL}${producto.imagen_url}`
        : undefined
    }));
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    throw new Error("Error al cargar los productos");
  }
};

// 6. Cambiar estado de un producto por ID
export const cambiarEstadoProducto = async (id: number, nuevoEstado: boolean) => {
  try {
    const { data } = await axios.patch(
      `${API_URL}/estado/${id}`,
      nuevoEstado,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    return data;
  } catch (error: any) {
    console.error(`Error al cambiar el estado del producto con ID ${id}:`, error);
    throw new Error(error.response?.data || "Error al cambiar el estado del producto");
  }
};

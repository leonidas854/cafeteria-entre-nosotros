import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/Agregacion`;


export type Categoria = string;
export type Subcategoria = string;
export interface CategoriaConSabores {
  categoria: string;
  sabores: string;
}
export interface Productos {
  id_producto: number;
  nombre: string;
}


export interface SaboresPorCategoria {
  [categoria: string]: string[];
}
export const getCategorias = async (): Promise<Categoria[]> => {
  try {
    const { data } = await axios.get<Categoria[]>(`${API_URL}/Producto/Categorias`,{
        withCredentials: true
    });
    return data;
  } catch (error: any) {
    console.error("Error al cargar las categorías:", error);
    throw new Error(error.response?.data || "Error al cargar las categorías");
  }
};


export const getSubcategorias = async (categoria: string): Promise<string[]> => {
  try {
    const { data } = await axios.get<string[]>(
      `${API_URL}/Producto/Subcategorias?categoria=${encodeURIComponent(categoria)}`,
      { withCredentials: true }
    );
    return data;
  } catch (error: any) {
    console.error("Error al cargar las subcategorías:", error);
    throw new Error(error.response?.data || "Error al cargar las subcategorías");
  }
};
export const getRoles = async (): Promise<string[]> => {
  try {
    const { data } = await axios.get<string[]>(`${API_URL}/Empleado/Roles`,{
        withCredentials: true
    });
    return data;
  } catch (error: any) {
    console.error("Error al cargar los roles:", error);
    throw new Error(error.response?.data || "Error al cargar los roles");
  }
}


export const getSaboresPorCategoria = async (): Promise<SaboresPorCategoria> => {
  try {
    const { data } = await axios.get<CategoriaConSabores[]>(`${API_URL}/Producto/Sabores`,{
        withCredentials: true
    });

    const saboresPorCategoria: SaboresPorCategoria = {};

    data.forEach(item => {
      const categoria = item.categoria || "Sin Categoría";
      const listaSabores = item.sabores
        .split(/,\s*| y /i) 
        .map(s => s.trim())
        .filter(sabor => sabor && sabor.toUpperCase() !== "S/D");

      if (!saboresPorCategoria[categoria]) {
        saboresPorCategoria[categoria] = [];
      }

      saboresPorCategoria[categoria].push(...listaSabores);
    });

    // Eliminar duplicados por categoría
    Object.keys(saboresPorCategoria).forEach(cat => {
      saboresPorCategoria[cat] = Array.from(new Set(saboresPorCategoria[cat]));
    });

    return saboresPorCategoria;
  } catch (error) {
    console.error("Error al obtener sabores por categoría:", error);
    return {};
  }
};

export const getProductos = async (): Promise<Productos[]> => {
  try {
    const { data } = await axios.get<Productos[]>(`${API_URL}/Producto/Productos`,{
        withCredentials: true
    });
    return data;
  } catch (error: any) {
    toast.error("Error al cargar los productos:", error);
    throw new Error(error.response?.data || "Error al cargar los productos");
  }
};


export const confirmarContrasenia = async (contra: string): Promise<string> => {
  try {
    const { data } = await axios.post<string>(
      `${API_URL}/Confirmar`,
      contra,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      }
    );
    return data;
  } catch (error: any) {
    toast.error("Error al confirmar la contraseña");
    throw new Error(error.response?.data || "Error al confirmar");
  }
};

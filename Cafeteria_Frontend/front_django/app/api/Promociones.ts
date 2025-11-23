import axios from 'axios';
import toast from 'react-hot-toast';
import {getProductos} from '@/app/api/productos';

const API_PROMOCIONES_URL = `${process.env.NEXT_PUBLIC_API}/api/promociones/`;
//const BASE_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
};
export interface Promocion {
  id: number;
  descripcion: string;
  descuento: number;
  fech_ini: string;
  fecha_final: string;
  strategykey: string;
  url_imagen: string;
  productos: number[];
  full_image_url?: string;
}


export interface NuevaPromocion {
  descripcion: string;
  descuento: number;
  fech_ini: string;     
  fecha_final: string;
  strategykey: string;
  imagen?: File;
  productos: number[];
}

export interface PromocionConIds {
  id: number;
  descripcion: string;
  descuento: number;
  fech_ini: string;
  fecha_final: string;
  strategykey: string;
  productos: number[]; 
  full_image_url?: string; 
}


export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  imagen_url?: string;
}


export interface Promocion2 {
  id: number;
  descripcion: string;
  descuento: number;
  fech_ini: string;       
  fecha_final: string;
  strategykey: string;
  url_imagen: string;
  productos: Producto[]; 
  full_image_url?: string;

}

export interface PromocionConProductos {
  id: number;
  descripcion: string;
  descuento: number;
  fech_ini: string;       
  fecha_final: string;
  strategykey: string;
  productos: Producto[]; 
  full_image_url?: string;
}


export const getPromociones = async (): Promise<Promocion[]> => {
  try {
    const response = await axios.get<Promocion[]>(API_PROMOCIONES_URL, {
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    toast.error("Error al cargar las promociones.");
    throw new Error(
      "Error al cargar las promociones: " +
        (error.response?.data?.message || error.message)
    );
  }
};


export const crearPromocion = async (promo: NuevaPromocion) => {
  const formData = new FormData();
  
  formData.append('descripcion', promo.descripcion);
  formData.append('descuento', promo.descuento.toString());
  formData.append('fech_ini', promo.fech_ini);
  formData.append('fecha_final', promo.fecha_final);
  formData.append('strategykey', promo.strategykey);

  if (promo.imagen) {

    formData.append('imagen', promo.imagen);
  }


  promo.productos.forEach((id) => {
    formData.append('productos', id.toString()); 
  });
  

  const csrfToken = getCsrfToken(); 
  if (!csrfToken) throw new Error("Token CSRF no encontrado.");

  try {
    const response = await axios.post(`${API_PROMOCIONES_URL}`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfToken,
      },
    });

    toast.success("Promoción creada exitosamente.");
    return response.data;
  } catch (error: any) {

    const errorData = error.response?.data;
    const msg = typeof errorData === 'object' ? Object.values(errorData).flat().join(' ') : 'Error al crear la promoción.';
    toast.error(msg);
    throw new Error(msg);
  }
};


export const editarPromocion = async (
  originalStrategyKey: string,
  data: Omit<NuevaPromocion, 'imagen'> // Omitimos el campo imagen para la actualización
) => {
   // ¡CORRECCIÓN! Los nombres de los campos deben estar en minúsculas y snake_case.
   const payload = {
    descripcion: data.descripcion,
    descuento: data.descuento,
    fech_ini: data.fech_ini,
    fecha_final: data.fecha_final,
    strategykey: data.strategykey,
    productos: data.productos,
  };

  const csrfToken = getCsrfToken();
  if (!csrfToken) throw new Error("Token CSRF no encontrado.");

  try {
    const response = await axios.put(
      `${API_PROMOCIONES_URL}${encodeURIComponent(originalStrategyKey)}/`, 
      payload, 
      {
        withCredentials: true,
        headers: {

          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        }
      }
    );

    toast.success("Promoción actualizada correctamente.");
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    const msg = typeof errorData === 'object' ? Object.values(errorData).flat().join(' ') : 'Error al editar promoción.';
    toast.error(msg);
    throw new Error(msg);
  }
};

export const eliminarPromocion = async (strategykey: string) => {
  const csrfToken = getCsrfToken();
  if (!csrfToken) throw new Error("Token CSRF no encontrado.");

  try {
    await axios.delete(`${API_PROMOCIONES_URL}${encodeURIComponent(strategykey)}/`, { 
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrfToken,
      }
    });

    toast.success("Promoción eliminada.");
  } catch (error: any) {
    const msg = error.response?.data?.detail || 'Error al eliminar promoción.';
    toast.error(msg);
    throw new Error(msg);
  }
};

export const Todas_las_Promociones = async (): Promise<Promocion2[]> => {
  try {

    const response = await axios.get<Promocion2[]>(`${API_PROMOCIONES_URL}/todas`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    toast.error("Error al cargar las promociones.");
    throw new Error(
      "Error al cargar las promociones: " +
        (error.response?.data?.message || error.message)
    );
  }
};


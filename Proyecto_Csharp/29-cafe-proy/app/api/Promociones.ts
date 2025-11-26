import axios from 'axios';
import toast from 'react-hot-toast';
import {getProductos} from '@/app/api/productos';

const API_PROMOCIONES_URL = `${process.env.NEXT_PUBLIC_API_URL}/Promociones`;
const BASE_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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


export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  imageUrl?: string;
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


export const getPromociones = async (): Promise<Promocion[]> => {
  try {
    const response = await axios.get<Promocion[]>(API_PROMOCIONES_URL, {
      withCredentials: true,
    });

    return response.data.map((promo) => ({
      ...promo,
      full_image_url: promo.url_imagen
        ? `${BASE_BACKEND_URL}${promo.url_imagen}`
        : undefined,
    }));
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

  formData.append('Descripcion', promo.descripcion);
  formData.append('Descuento', promo.descuento.toString());
  formData.append('Fech_ini', promo.fech_ini);
  formData.append('Fecha_final', promo.fecha_final);
  formData.append('Strategykey', promo.strategykey);

  if (promo.imagen) {
    formData.append('Imagen', promo.imagen);
  }

  promo.productos.forEach((id) => {
    formData.append('Productos', id.toString()); 
  });

  try {
    const response = await axios.post(`${API_PROMOCIONES_URL}`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success("Promoción creada exitosamente.");
    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Error al crear la promoción.';
    toast.error(msg);
    throw new Error(msg);
  }
};


export const editarPromocion = async (
  originalStrategyKey: string,
  data: NuevaPromocion
) => {
   const payload = {
    descripcion: data.descripcion,
    descuento: data.descuento,
    fech_ini: data.fech_ini,
    fecha_final: data.fecha_final,
    strategykey: data.strategykey,
    productos: data.productos,
   
  };

  try {
    const response = await axios.put(
      `${API_PROMOCIONES_URL}/${originalStrategyKey}`,
      payload, 
      {
        withCredentials: true,
     
      }
    );

    toast.success("Promoción actualizada correctamente.");
    return response.data;
  } catch (error: any) {
    const msg = error.response?.data || 'Error al editar promoción.';
    toast.error(msg);
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
};

export const eliminarPromocion = async (strategykey: string) => {
  try {
    await axios.delete(`${API_PROMOCIONES_URL}/${strategykey}`, {
      withCredentials: true,
    });

    toast.success("Promoción eliminada.");
  } catch (error: any) {
    const msg = error.response?.data || 'Error al eliminar promoción.';
    toast.error(msg);
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
};

export const Todas_las_Promociones = async (): Promise<Promocion2[]> => {
  try {

    const response = await axios.get<Promocion2[]>(`${API_PROMOCIONES_URL}/todas`, {
      withCredentials: true,
    });

    return response.data.map((promo) => ({
      ...promo,
      full_image_url: promo.url_imagen
        ? `${BASE_BACKEND_URL}${promo.url_imagen}`
        : undefined,
    }));
  } catch (error: any) {
    toast.error("Error al cargar las promociones.");
    throw new Error(
      "Error al cargar las promociones: " +
        (error.response?.data?.message || error.message)
    );
  }
};


// app/cajero/types.ts
import { Producto } from '@/src/features/menu/api/productos'; 

export interface ExtraItemPedido {
  extraId: number;
  nombre: string;
  precio: number;
}

export interface ItemPedido {
  productoId: number;
  nombre: string;
  categoria: string; 
  precioUnitario: number;
  cantidad: number;
  extras: ExtraItemPedido[];
}

export type GroupedProducts = {
  [categoria: string]: {
    subcategorias?: {
      [subcategoria: string]: Producto[];
    };
    sinSubcategoria?: Producto[];
  };
};
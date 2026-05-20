import { useState, useEffect } from 'react';
import { getProductos, Producto } from '@/src/features/menu/api/productos';
import { obtenerCarrito } from '@/src/features/menu/api/Carrito';
import { apiClient as axios } from '@/src/shared/api/apiClient';

export type GroupedProducts = {
  [categoria: string]: {
    subcategorias?: {
      [subcategoria: string]: Producto[];
    };
    sinSubcategoria?: Producto[]; 
  };
};

export interface ExtraCarrito {
  extraId: number;
  nombre: string;
  precio: number;
}

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  categoria: string;
  precioUnitario: number;
  cantidad: number;
  extras: ExtraCarrito[];
  tienePromocion: boolean;
  precioPromocional?: number;
  descripcionPromocion?: string;
}

export interface Carrito {
  id?: string;
  clienteId?: number;
  items: ItemCarrito[];
}

export function useMenu() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [carritoCargando, setCarritoCargando] = useState(true);
  const [mostrarBotonHistorial, setMostrarBotonHistorial] = useState(false);

  const totalItems = carrito?.items.reduce((sum, item) => sum + item.cantidad, 0) || 0;
  const totalAmount = carrito?.items.reduce((sum, item) => {
    const precio = item.precioPromocional ?? item.precioUnitario;
    const extras = item.extras?.reduce((eSum, e) => eSum + e.precio, 0) || 0;
    return sum + (precio + extras) * item.cantidad;
  }, 0) || 0;

  const cargarCarrito = async () => {
    try {
      const data = await obtenerCarrito();
      if (data && !('error' in data)) {
        setCarrito(data);
      } else {
        setCarrito(null);
      }
    } catch (err) {
      console.error('Error al obtener el carrito:', err);
      setCarrito(null);
    } finally {
      setCarritoCargando(false);
    }
  };

  const verificarPedidos = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/Pedido/mis-pedidos`, {
        withCredentials: true
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setMostrarBotonHistorial(true);
      } else {
        setMostrarBotonHistorial(false);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        setMostrarBotonHistorial(false);
      } else {
        console.error("Error al verificar pedidos:", error);
      }
    }
  };

  const agruparPorCategoria = (productos: Producto[]): GroupedProducts => {
    const agrupado: GroupedProducts = {};

    productos.forEach((producto) => {
      const categoria = producto.categoria?.trim();
      const subcategoria = producto.sub_categoria?.trim();

      if (!categoria || categoria === "S/D") return;

      if (!agrupado[categoria]) {
        agrupado[categoria] = {};
      }

      if (subcategoria && subcategoria !== "S/D") {
        if (!agrupado[categoria].subcategorias) {
          agrupado[categoria].subcategorias = {};
        }
        if (!agrupado[categoria].subcategorias![subcategoria]) {
          agrupado[categoria].subcategorias![subcategoria] = [];
        }
        agrupado[categoria].subcategorias![subcategoria].push(producto);
      } else {
        if (!agrupado[categoria].sinSubcategoria) {
          agrupado[categoria].sinSubcategoria = [];
        }
        agrupado[categoria].sinSubcategoria!.push(producto);
      }
    });

    return agrupado;
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductos();
        setProductos(data);
        const agrupado = agruparPorCategoria(data);
        setGroupedProducts(agrupado);
        setActiveCategory(null);
        setActiveSubcategory(null);
      } catch (err) {
        setError('Error al cargar los productos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarCarrito();
    verificarPedidos();
    fetchProductos();
  }, []);

  const handleCategorySelect = (category: string, subcategory: string | null = null) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
  };

  return {
    productos,
    loading,
    error,
    activeCategory,
    activeSubcategory,
    groupedProducts,
    carrito,
    carritoCargando,
    mostrarBotonHistorial,
    totalItems,
    totalAmount,
    cargarCarrito,
    handleCategorySelect
  };
}

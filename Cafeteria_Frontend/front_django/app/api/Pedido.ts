import axios from 'axios';
import toast from 'react-hot-toast';
const API_URL_ = `${process.env.NEXT_PUBLIC_API_URL}/Pedido`;

export const confirmarPedido = async (
  carritoId: string,
  tipoEntrega: 'Mesa' | 'Llevar', 
  tipoPago: 'Efectivo' | 'Tarjeta' | 'Qr' 
) => {
  try {
    const response = await axios.post(
      `${API_URL_}/confirmar`,
      null,
      {
        params: {
          carritoId,
          tipoEntrega,
          tipo_pago: tipoPago
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al confirmar el pedido:", error);
    throw new Error(error.response?.data || "No se pudo confirmar el pedido");
  }
};

export const fetchPedidos = async (
  setPedidos: (data: any[]) => void,
  setSinPedidos: (val: boolean) => void,
  setLoading: (val: boolean) => void
) => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/pedidos/mis-pedidos/`, {
      withCredentials: true,
    });

    if (res.data.length === 0) {
      setSinPedidos(true);
    } else {
      const pedidosOrdenados = res.data.sort((a: any, b: any) => b.id_pedido - a.id_pedido);
      setPedidos(pedidosOrdenados);
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      setSinPedidos(true);
    } else {
      toast.error("No se pudieron cargar tus pedidos.");
    }
  } finally {
    setLoading(false);
  }
};

export const fetchVentas = async (
  setVentas: (data: any[]) => void,
  setSinVentas: (val: boolean) => void,
  setLoading: (val: boolean) => void
) => {
  try {
    const res = await axios.get(`${API_URL_}/mis-ventas`, {
      withCredentials: true,
    });

    if (res.data.length === 0) {
      setSinVentas(true);
    } else {
      const ventasOrdenadas = res.data.sort((a: any, b: any) =>
        new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime()
      );
      setVentas(ventasOrdenadas);
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      setSinVentas(true);
    } else {
      toast.error("No se pudieron cargar las ventas.");
    }
  } finally {
    setLoading(false);
  }
};


export const cambiarEstadoPedido = async (
  pedidoId: number,
  nuevoEstado: string
): Promise<void> => {
  try {
    const res = await axios.put(
      `${API_URL_}/cambiar-estado/${pedidoId}`,
      null,
      {
        params: { nuevoEstado },
        withCredentials: true,
      }
    );
    toast.success(`Estado actualizado a "${res.data.nuevo_estado}"`);
  } catch (error: any) {
    console.error("Error al cambiar estado del pedido:", error);
    toast.error("No se pudo actualizar el estado del pedido.");
  }
};



export const fetchTodosPedidos = async (
  setPedidos: (data: any[]) => void,
  setSinPedidos: (val: boolean) => void,
  setLoading: (val: boolean) => void
) => {
  try {
    const res = await axios.get(`${API_URL_}/todos-pedidos`, {
      withCredentials: true,
    });

    if (res.data.length === 0) {
      setSinPedidos(true);
    } else {
      const pedidosOrdenados = res.data.sort((a: any, b: any) => b.id_pedido - a.id_pedido);
      setPedidos(pedidosOrdenados);
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      setSinPedidos(true);
    } else {
      toast.error("No se pudieron cargar los pedidos.");
    }
  } finally {
    setLoading(false);
  }
};
//Todas-las-ventas


export const fetchTodasVentas = async (
  setVentas: (data: any[]) => void,
  setSinVentas: (val: boolean) => void,
  setLoading: (val: boolean) => void
) => {
  try {
    const res = await axios.get(`${API_URL_}/Todas-las-ventas`, {
      withCredentials: true,
    });

    if (res.data.length === 0) {
      setSinVentas(true);
    } else {
      const ventasOrdenadas = res.data.sort((a: any, b: any) =>
        new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime()
      );
      setVentas(ventasOrdenadas);
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      setSinVentas(true);
    } else {
      toast.error("No se pudieron cargar las ventas.");
    }
  } finally {
    setLoading(false);
  }
};

export const fetchPedidosConInfoCompleta = async (
  setData: (data: any[]) => void,
  setSinData: (val: boolean) => void,
  setLoading: (val: boolean) => void
) => {
  try {
    const res = await axios.get(`${API_URL_}/info-completa-todos`, {
      withCredentials: true,
    });

    if (!res.data || res.data.length === 0) {
      setSinData(true);
      return;
    }

    const ordenados = res.data.sort(
      (a: any, b: any) => b.pedido.id_pedido - a.pedido.id_pedido 
    );

    setData(ordenados);
  } catch (error: any) {
    toast.error("No se pudo cargar la información completa de pedidos.");
    console.error(error);
  } finally {
    setLoading(false);
  }
};



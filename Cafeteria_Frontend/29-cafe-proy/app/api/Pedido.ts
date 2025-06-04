import axios from 'axios';

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

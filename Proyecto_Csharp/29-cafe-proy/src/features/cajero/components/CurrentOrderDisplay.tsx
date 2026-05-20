'use client';

import { useState, useEffect } from 'react';
import { ItemPedido, ExtraItemPedido } from '../type';
import toast from 'react-hot-toast';

import {
  buscarClientePorNIT as buscarClienteApi,
  registrarClienteManual as registrarClienteApi,
  buscarClientePorId as buscarClientePorIdApi,
  actualizarApellidoPorNIT
} from '@/src/features/cajero/api/Cajerro';

import {
  obtenerCarrito,
  modificarCantidad,
  modificarExtras,
  quitarProducto,
  eliminarCarrito,
  asignarCarritoACliente
} from '@/src/features/menu/api/Carrito';

import {confirmarPedido} from '@/src/features/cajero/api/Pedido';


export interface UsuarioNit {
  id: number;
  apell_paterno: string;
  NIT: number;
  usuario: string;
  password: string;
}

import { apiClient as axios } from '@/src/shared/api/apiClient';
import { ClientSearchModal } from './ClientSearchModal';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { OrderItemRow } from './OrderItemRow';

interface CurrentOrderDisplayProps {
  items: ItemPedido[];
  onUpdateQuantity: () => Promise<void>;
  onRemoveItem: () => Promise<void>;
  onClearOrder: () => void;
  
  isSubmitting: boolean;
  cliente: UsuarioNit | null;
  setCliente: (cliente: UsuarioNit | null) => void;
}

export const obtenerExtrasDisponibles = async (): Promise<ExtraItemPedido[] | null | { error: string }> => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/Extras`, {
      withCredentials: true
    });

    if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
      return null; 
    }

    const adaptados: ExtraItemPedido[] = res.data.map((e: any) => ({
      extraId: e.id,
      nombre: e.nombre,
      precio: e.precio
    }));

    return adaptados;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('No autorizado para obtener extras');
      return { error: 'NO_AUTORIZADO' };
    }

    console.error('Error inesperado al obtener los extras:', error);
    return null;
  }
};


const esCafe = (nombre: string, categoria?: string) => {
  const claves = ['café', 'cafe'];
  return claves.some(c =>
    nombre.toLowerCase().includes(c) ||
    (categoria && categoria.toLowerCase().includes(c))
  );
};

export default function CurrentOrderDisplay({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  
  isSubmitting,
  cliente,
  setCliente,
}: CurrentOrderDisplayProps) {

  const [extrasDisponibles, setExtrasDisponibles] = useState<ExtraItemPedido[]>([]);
  const [tipoOrden, setTipoOrden] = useState<'llevar' | 'mesa'>('llevar');
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'qr' | 'efectivo'>('efectivo');
  const [mostrarModalNIT, setMostrarModalNIT] = useState(false);
  const [nitInput, setNitInput] = useState('');
  const [clienteNit, setClienteNit] = useState<any | null>(null);
  const [apellidoManual, setApellidoManual] = useState('');
  const [clienteNoEncontrado, setClienteNoEncontrado] = useState(false);



  

  

 useEffect(() => {
    const fetchExtras = async () => {
      const res = await obtenerExtrasDisponibles();
      if (res && !('error' in res)) {
        setExtrasDisponibles(res);
      }
    };
    fetchExtras();
  }, []);

  const totalPedido = items.reduce((sum, item) => {
    const extrasTotal = item.extras.reduce((eSum, e) => eSum + e.precio, 0);
    return sum + (item.precioUnitario + extrasTotal) * item.cantidad;
  }, 0);

  const buscarClientePorNIT = async () => {
    try {
      const data = await buscarClienteApi(nitInput);
      setClienteNit(data);
      toast.success(`Cliente encontrado: ${data.usuario}`);
      setCliente(data); // asignar también el cliente
setClienteNoEncontrado(false);
    } catch {
      toast.error("NIT no encontrado");
      setClienteNit(null);
      setClienteNoEncontrado(true);
    }
  };

  const handleModificarCantidad = async (productoId: number, nuevaCantidad: number, extrasIds: number[]) => {
    try {
      await modificarCantidad(productoId, extrasIds, nuevaCantidad);
      await onUpdateQuantity();
      toast.success("Cantidad actualizada");
    } catch (error) {
      console.error("Error al modificar cantidad:", error);
      toast.error("No se pudo actualizar la cantidad");
    }
  };

const handleConfirmarPedido = async () => {
  try {
    const carrito = await obtenerCarrito();
    if (!carrito?.id) {
      toast.error("Carrito no encontrado");
      return;
    }
    
    if (!carrito.clienteId) {
  toast.error("Debe asignar un cliente antes de confirmar el pedido");
  return;
}
    // Transformar los valores seleccionados de los radio buttons
    const tipoEntregaBack = tipoOrden.charAt(0).toUpperCase() + tipoOrden.slice(1); 
    const metodoPagoBack = metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1);

    const resultado = await confirmarPedido(
      carrito.id,
      tipoEntregaBack as 'Mesa' | 'Llevar',
      metodoPagoBack as 'Efectivo' | 'Tarjeta' | 'Qr'
    );

    toast.success(`Pedido confirmado. Total: Bs. ${(resultado.total_estimado - resultado.total_descuento).toFixed(2)}`);
    onClearOrder();

   setNitInput('');
      setClienteNit(null);
      setClienteNoEncontrado(false);
      setCliente(null);
  } catch (error: any) {
    toast.error(error.message || "Error al confirmar el pedido");
  }
};



  const handleQuitarProducto = async (productoId: number, extrasIds: number[]) => {
    try {
      await quitarProducto(productoId, extrasIds);
      await onRemoveItem();
      toast.success("Producto eliminado del pedido");
    } catch (error) {
      console.error("Error al quitar producto:", error);
      toast.error("No se pudo eliminar el producto");
    }
  };

  const handleModificarExtras = async (productoId: number, nuevosExtras: ExtraItemPedido[]) => {
    try {
      await modificarExtras(productoId, nuevosExtras);
      await onUpdateQuantity();
      toast.success("Extras modificados correctamente");
    } catch (error) {
      console.error("Error al modificar extras:", error);
      toast.error("No se pudieron modificar los extras");
    }
  };

  const handleAgregarExtra = (item: ItemPedido, extra: ExtraItemPedido) => {
    const nuevosExtras = [...item.extras, extra];
    handleModificarExtras(item.productoId, nuevosExtras);
  };

  const handleEliminarCarrito = async () => {
    try {
      const carrito = await obtenerCarrito();
      if (!carrito?.id) {
        toast.error("Carrito no encontrado");
        return;
      }
      await eliminarCarrito(carrito.id);
      onClearOrder();
      toast.success("Pedido limpiado correctamente");
      setNitInput('');
      setClienteNit(null);
      setClienteNoEncontrado(false);
      setCliente(null);
    } catch (error) {
      console.error("Error al eliminar el carrito:", error);
      toast.error("No se pudo limpiar el pedido");
    }
  };

  const registrarClienteManual = async (sinNit = false) => {
    try {
       if (!apellidoManual.trim()) {
  toast.error("Debe ingresar un apellido válido");
  return;
}
      const nuevoCliente = await registrarClienteApi(apellidoManual, nitInput, sinNit);
      setCliente(nuevoCliente);

      const carrito = await obtenerCarrito();
        if (carrito?.id) {
          await asignarCarritoACliente(carrito.id, nuevoCliente.id);
        }
       


      toast.success("Cliente registrado con éxito");
      setMostrarModalNIT(false);
      setClienteNoEncontrado(false);
    } catch {
      toast.error("Error al registrar el cliente");
    }
  };





  return (
    <div className="p-4 bg-white rounded-lg shadow-xl h-full flex flex-col relative">
      <h2 className="text-xl font-bold text-gray-800 mb-3">Pedido Actual</h2>

      {cliente && (
  <div className="mb-2 text-sm text-gray-700 font-medium">
    Cliente: <span className="text-amber-600">{cliente.apell_paterno}</span>
  </div>
)}

      {/* Lista de productos */}
      {items.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="p-4 text-center text-gray-400">
            El pedido está vacío. <br /> Añade productos del catálogo.
          </p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto mb-3 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}>
          {items.map((item) => (
            <OrderItemRow
              key={item.productoId}
              item={item}
              handleQuitarProducto={handleQuitarProducto}
              handleModificarCantidad={handleModificarCantidad}
              handleModificarExtras={handleModificarExtras}
              handleAgregarExtra={handleAgregarExtra}
              esCafe={esCafe}
              extrasDisponibles={extrasDisponibles}
            />
          ))}
        </div>
      )}

      <PaymentMethodSelector
        tipoOrden={tipoOrden}
        setTipoOrden={setTipoOrden}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
      />

      {/* Botón NIT */}
      <div className="mb-3 flex gap-3">
  <button
    onClick={() => setMostrarModalNIT(true)}
    className="flex-1 text-sm bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded"
  >
    Buscar por NIT
  </button>
  <button
    onClick={() => {
      setNitInput('');
      setClienteNit(null);
      setClienteNoEncontrado(false);
      setCliente(null);
      toast.success("NIT borrado");
    }}
    className="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
  >
    Borrar NIT
  </button>
</div>

      {/* Modal NIT */}

      {mostrarModalNIT && (
        <ClientSearchModal
          mostrarModalNIT={mostrarModalNIT}
          setMostrarModalNIT={setMostrarModalNIT}
          nitInput={nitInput}
          setNitInput={setNitInput}
          clienteNit={clienteNit}
          setClienteNit={setClienteNit}
          clienteNoEncontrado={clienteNoEncontrado}
          setClienteNoEncontrado={setClienteNoEncontrado}
          apellidoManual={apellidoManual}
          setApellidoManual={setApellidoManual}
          registrarClienteManual={registrarClienteManual}
          buscarClientePorNIT={buscarClientePorNIT}
          setCliente={setCliente}
        />
)}


      {/* Total y acciones */}
      <div className="mt-auto pt-3 border-t border-gray-200">
        <p className="text-lg font-bold text-gray-800 flex justify-between mb-2">
          <span>TOTAL:</span>
          <span>Bs. {totalPedido.toFixed(2)}</span>
        </p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={
              handleConfirmarPedido
            }
            disabled={isSubmitting || items.length === 0}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:opacity-50 text-sm"
          >
            {isSubmitting ? 'Procesando...' : 'Finalizar y Cobrar'}
          </button>


          <button
          
            onClick={
              
handleEliminarCarrito
            }
            disabled={items.length === 0}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 text-sm"
          >
            Limpiar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

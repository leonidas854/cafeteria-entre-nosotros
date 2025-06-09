'use client';

import { useState, useEffect } from 'react';
import { ItemPedido } from '../type';
import toast from 'react-hot-toast';

import {
  buscarClientePorNIT as buscarClienteApi,
  registrarClienteManual as registrarClienteApi,
  buscarClientePorId as buscarClientePorIdApi,
} from '@/app/api/Cajerro';

import {
  obtenerCarrito,
  modificarCantidad,
  modificarExtras,
  quitarProducto,
  eliminarCarrito,
  asignarCarritoACliente
} from '@/app/api/Carrito';

import {confirmarPedido} from '@/app/api/Pedido';


export interface UsuarioNit {
  id: number;
  apell_paterno: string;
  NIT: number;
  usuario: string;
  password: string;
}
interface ExtraCarrito {
  extraId: number;
  nombre: string;
  precio: number;
}

import axios from 'axios';

interface CurrentOrderDisplayProps {
  items: ItemPedido[];
  onUpdateQuantity: () => Promise<void>;
  onRemoveItem: () => Promise<void>;
  onClearOrder: () => void;
  
  isSubmitting: boolean;
  cliente: UsuarioNit | null;
  setCliente: (cliente: UsuarioNit | null) => void;
}

export const obtenerExtrasDisponibles = async (): Promise<ExtraCarrito[] | null | { error: string }> => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/Extras`, {
      withCredentials: true
    });

    if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
      return null; 
    }

    const adaptados: ExtraCarrito[] = res.data.map((e: any) => ({
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

  const [extrasDisponibles, setExtrasDisponibles] = useState<ExtraCarrito[]>([]);
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
      setCliente(null);
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

  const handleModificarExtras = async (productoId: number, nuevosExtras: ExtraCarrito[]) => {
    try {
      await modificarExtras(productoId, nuevosExtras);
      await onUpdateQuantity();
      toast.success("Extras modificados correctamente");
    } catch (error) {
      console.error("Error al modificar extras:", error);
      toast.error("No se pudieron modificar los extras");
    }
  };

  const handleAgregarExtra = (item: ItemPedido, extra: ExtraCarrito) => {
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
    } catch (error) {
      console.error("Error al eliminar el carrito:", error);
      toast.error("No se pudo limpiar el pedido");
    }
  };

  const registrarClienteManual = async (sinNit = false) => {
    try {
      const nuevoCliente = await registrarClienteApi(apellidoManual, nitInput, sinNit);
      setCliente(nuevoCliente);
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
            <div key={item.productoId} className="border-b py-2.5 last:border-b-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-semibold text-sm text-gray-700 leading-tight">{item.nombre}</p>
                  <p className="text-xs text-gray-500">Bs. {item.precioUnitario.toFixed(2)}</p>
                </div>
                <button
                  onClick={() =>
                    handleQuitarProducto(
                      item.productoId,
                      item.extras.map((e) => e.extraId)
                    )
                  }
                  className="text-red-500 hover:text-red-700 text-lg font-semibold p-0 leading-none"
                >
                  ×
                </button>

              </div>
              <div className="flex items-center">
                <button
                 onClick={() => handleModificarCantidad(item.productoId, item.cantidad - 1, item.extras.map(e => e.extraId))}
                  disabled={item.cantidad <= 1}
                  className="px-2 py-0.5 border rounded-l bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700"
                >
                  -
                </button>
                <span className="px-3 py-0.5 border-t border-b text-gray-700 text-sm">{item.cantidad}</span>
                <button
                 onClick={() => handleModificarCantidad(item.productoId, item.cantidad + 1, item.extras.map(e => e.extraId))}
                  className="px-2 py-0.5 border rounded-r bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  +
                </button>
                <p className="ml-auto font-semibold text-sm text-gray-700">
                  Bs. {(item.precioUnitario * item.cantidad).toFixed(2)}
                </p>
              </div>

              {item.extras.length > 0 && (
  <div className="mt-1 pl-2 space-y-1">
    {item.extras.map(extra => (
      <div key={`${item.productoId}-${extra.extraId}`}
 className="flex justify-between items-center text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
        <span>+ {extra.nombre} (Bs. {extra.precio.toFixed(2)})</span>
        <button
          onClick={() => {
            const nuevosExtras = item.extras.filter(e => e.extraId !== extra.extraId);
            handleModificarExtras(item.productoId, nuevosExtras);
          }}
          className="text-red-500 hover:text-red-700 ml-2 font-bold"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)}

            {esCafe(item.nombre, item.categoria) && (
  <div className="mt-1 pl-2">
    <p className="text-xs font-semibold text-gray-600">Añadir extra:</p>

    {extrasDisponibles.filter(extra => !item.extras.some(e => e.extraId === extra.extraId)).length === 0 ? (
      <p className="text-xs text-gray-400">Todos los extras ya fueron agregados.</p>
    ) : (
      extrasDisponibles
        .filter(extra => !item.extras.some(e => e.extraId === extra.extraId))
        .map(extra => (
          <button
            key={`disp-${item.productoId}-${extra.extraId}`}
            onClick={() => handleAgregarExtra(item, extra)}
            className="text-xs bg-amber-100 hover:bg-amber-200 text-gray-800 rounded px-2 py-1 mr-2 mt-1"
          >
            + {extra.nombre} (Bs. {extra.precio.toFixed(2)})
          </button>
        ))
    )}
  </div>
)}




            </div>
          ))}
        </div>
      )}

      {/* Tipo de orden */}
      <div className="mb-3">
        <p className="font-semibold text-sm text-gray-700 mb-1">Tipo de Orden:</p>
        <div className="flex space-x-4">
          {["llevar", "mesa"].map(tipo => (
            <label key={tipo} className="flex items-center space-x-1 text-sm text-gray-600">
              <input
                type="radio"
                name="tipoOrden"
                value={tipo}
                checked={tipoOrden === tipo}
                onChange={() => setTipoOrden(tipo as 'llevar' | 'mesa')}
              />
              <span>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Método de pago */}
      <div className="mb-3">
        <p className="font-semibold text-sm text-gray-700 mb-1">Método de Pago:</p>
        <div className="flex space-x-4 flex-wrap">
          {["tarjeta", "qr", "efectivo"].map(metodo => (
            <label key={metodo} className="flex items-center space-x-1 text-sm text-gray-600">
              <input
                type="radio"
                name="metodoPago"
                value={metodo}
                checked={metodoPago === metodo}
                onChange={() => setMetodoPago(metodo as 'tarjeta' | 'qr' | 'efectivo')}
              />
              <span>{metodo.charAt(0).toUpperCase() + metodo.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Botón NIT */}
      <div className="mb-3">
        <button
          onClick={() => setMostrarModalNIT(true)}
          className="w-full text-sm bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded"
        >
          Buscar por NIT
        </button>
      </div>




      {/* Modal NIT */}

    {mostrarModalNIT && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg text-gray-800 w-80">
      <h3 className="text-lg font-bold mb-3">Buscar cliente por NIT</h3>

      <label className="text-sm font-medium block mb-1">NIT:</label>
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="number"
          value={nitInput}
          onChange={(e) => setNitInput(e.target.value)}
          readOnly={!!clienteNit}
          className={`flex-1 px-3 py-1.5 border rounded bg-${clienteNit ? 'gray-100' : 'white'} border-gray-300`}
        />
        {clienteNit && (
          <button
            onClick={() => {
              setClienteNit(null);
              setClienteNoEncontrado(false);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Editar
          </button>
        )}
      </div>

      {/* Si encontró cliente */}
      {clienteNit ? (
        <>
          <label className="text-sm font-medium block mb-1 mt-2">Apellido Paterno:</label>
          <input
            type="text"
            value={clienteNit.apell_paterno}
            onChange={(e) =>
              setClienteNit({ ...clienteNit, apell_paterno: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded mb-3"
          />

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setMostrarModalNIT(false)}
              className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
  try {
    if (!clienteNit?.id) return;

    const carrito = await obtenerCarrito();
    if (carrito?.id) {
      await asignarCarritoACliente(carrito.id, clienteNit.id);
    }

    setCliente(clienteNit);
    toast.success("Cliente confirmado y carrito asignado.");
    setMostrarModalNIT(false);
    setClienteNoEncontrado(false);
  } catch (error) {
    console.error("Error al asignar el carrito al cliente:", error);
    toast.error("No se pudo asignar el carrito al cliente.");
  }
}}
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Confirmar
            </button>
          </div>
        </>
      ) : !clienteNoEncontrado ? (
        // Si aún no buscó
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setMostrarModalNIT(false)}
            className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={buscarClientePorNIT}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Buscar
          </button>


         <button
            onClick={async () => {
              try {
              const nit = '7777777';
              const cliente = await buscarClienteApi(nit);

              if (!cliente?.id ) {
              toast.error("No se pudo obtener cliente o carrito");
               return;
              }

              const carrito = await obtenerCarrito();
              if (carrito?.id) {
              await asignarCarritoACliente(carrito.id, cliente.id);
              }

              setCliente(cliente);
              toast.success("Cliente LOCAL asignado correctamente");
              setMostrarModalNIT(false);
              setClienteNoEncontrado(false);
              } catch (error) {
              console.error("Error al asignar cliente LOCAL:", error);
              toast.error("No se pudo asignar el cliente LOCAL");
              }
                 }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded"
          >
              Usar Cliente LOCAL
          </button>



        </div>
      ) : (
        // Si no encontró cliente
        
        <>
          <label className="text-sm font-medium block mb-1 mt-3">No se encontro su NIT, por favor registrese con un apellido</label>
          <label className="text-sm font-medium block mb-1 mt-3">Apellido Paterno:</label>
          <input
            type="text"
            value={apellidoManual}
            onChange={(e) => setApellidoManual(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded mb-3"
          />

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => registrarClienteManual(false)}
              className="w-full bg-[#543F1D] hover:bg-amber-700 text-white py-1.5 rounded"
            >
              Registrar con este NIT
            </button>
            <button
                    onClick={() => {
                      setClienteNit(null);
                      setClienteNoEncontrado(false);
                    }}
                    className="w-full bg-[#FE9A00] hover:bg-amber-700 text-white py-1.5 rounded"
                  >
                    Editar
                  </button>
            
            <button
              onClick={() => setMostrarModalNIT(false)}
              className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  </div>
)}


      {/* Total y acciones */}
      <div className="mt-auto pt-3 border-t border-gray-200">
        <p className="text-lg font-bold text-gray-800 flex justify-between mb-2">
          <span>TOTAL:</span>
          <span>Bs. {totalPedido.toFixed(2)}</span>
        </p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleConfirmarPedido}
            disabled={isSubmitting || items.length === 0}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:opacity-50 text-sm"
          >
            {isSubmitting ? 'Procesando...' : 'Finalizar y Cobrar'}
          </button>


          <button
            onClick={handleEliminarCarrito}
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

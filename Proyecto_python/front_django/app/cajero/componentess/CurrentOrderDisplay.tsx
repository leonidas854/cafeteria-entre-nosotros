'use client';

import { useState, useEffect } from 'react';
import { ItemPedido } from '../type';
import toast from 'react-hot-toast';

import {
  buscarClientePorNIT as buscarClienteApi,
  registrarClienteManual as registrarClienteApi,
  buscarClientePorId as buscarClientePorIdApi,
  actualizarApellidoPorNIT
} from '@/app/api/Cajerro';

import {
  obtenerCarrito,
  modificarCantidad,
  modificarExtras,
  quitarProducto,
  eliminarCarrito,
  asignarCarritoACliente,
  ItemCarrito,
  Carrito,
  Extra,
  agregarProductoAlCarrito
} from '@/app/api/Carrito';

import {confirmarPedido} from '@/app/api/Pedido';


interface CurrentOrderDisplayProps {
  carrito: Carrito | null; 
  refrescarCarrito: () => Promise<void>; 
  cliente: UsuarioNit | null;
  setCliente: (cliente: UsuarioNit | null) => void;
}
export interface UsuarioNit {
  id: number;
  apell_paterno: string;
  nit: number;
  usuario: string;
  password: string;
}
interface ExtraCarrito {
  extraId: number;
  nombre: string;
  precio: number;
}

export interface ExtraDisponible {
  id: number;
  nombre: string;
  precio: number;
}
import axios from 'axios';


const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
};

export default function CurrentOrderDisplay({ carrito,
   refrescarCarrito, cliente, setCliente }: CurrentOrderDisplayProps) {

  const [extrasDisponibles, setExtrasDisponibles] = useState<ExtraDisponible[]>([]);
  const [tipoOrden, setTipoOrden] = useState<'llevar' | 'mesa'>('llevar');
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'qr' | 'efectivo'>('efectivo');
  const [mostrarModalNIT, setMostrarModalNIT] = useState(false);
  const [nitInput, setNitInput] = useState('');
  const [clienteNit, setClienteNit] = useState<UsuarioNit | null>(null);
  const [apellidoManual, setApellidoManual] = useState('');
  const [clienteNoEncontrado, setClienteNoEncontrado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigningClient, setIsAssigningClient] = useState(false);



  const obtenerExtras = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/extras/`, { withCredentials: true });
      if (res.data && Array.isArray(res.data)) {
        setExtrasDisponibles(res.data);
      }
    } catch (error) {
      console.error('Error al obtener extras:', error);
    }
  };


const esCafe = (nombre: string, categoria?: string) => {
  const claves = ['café', 'cafe'];
  return claves.some(c =>
    nombre.toLowerCase().includes(c) ||
    (categoria && categoria.toLowerCase().includes(c))
  );
};




  useEffect(() => {
    obtenerExtras();
  }, []);

  const items = carrito?.items || [];
  
  const totalPedido = items.reduce((sum, item) => {
    const extrasTotal = item.extras.reduce((eSum, e) => eSum + e.precio, 0);
    const precioConPromo = item.precio_promocional ?? item.precio_unitario;
    return sum + (precioConPromo + extrasTotal) * item.cantidad;
  }, 0);

  const buscarClientePorNIT = async () => {
    try {
      const data = await buscarClienteApi(nitInput);
      setClienteNit(data);
      toast.success(`Cliente encontrado: ${data.usuario}`);
      setCliente(data); 
setClienteNoEncontrado(false);

    } catch {
      toast.error("NIT no encontrado");
      setClienteNit(null);
      setClienteNoEncontrado(true);
    }
  };

 const handleModificarCantidad = async (itemId: number, nuevaCantidad: number) => {
    try {
      const carritoActualizado = await modificarCantidad(itemId, nuevaCantidad);
      await refrescarCarrito();
      toast.success("Cantidad actualizada.");
    } catch (error) {
      toast.error("No se pudo actualizar la cantidad.");
    }
  };

  const handleQuitarProducto = async (itemId: number) => {
    try {
      const carritoActualizado = await quitarProducto(itemId);
      await refrescarCarrito();
      toast.error("Producto eliminado.");
    } catch (error) {
      toast.error("No se pudo quitar el producto.");
    }
  };

const handleConfirmarPedido = async () => {
    setIsSubmitting(true);

    // 1. Las validaciones iniciales se mantienen, son correctas.
    if (!metodoPago) {
      toast.error("⚠️ Debes seleccionar un método de pago.");
      setIsSubmitting(false);
      return;
    }
    if (!tipoOrden) {
      toast.error("⚠️ Debes seleccionar un tipo de entrega.");
      setIsSubmitting(false);
      return;
    }
    if (!carrito || !carrito.id || carrito.items.length === 0) { 
      toast.error("⚠️ El carrito está vacío o no está disponible.");
      setIsSubmitting(false);
      return;
    }

    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      toast.error("Token de seguridad no encontrado. No se puede continuar.");
      setIsSubmitting(false);
      return;
    }

    try {
      const body = {
        carrito_id: carrito.id,
        tipo_entrega: tipoOrden,
        tipo_pago: metodoPago
      };

    
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/carrito/confirmar-pedido/`,
        body,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
        }
      );

      console.log("Pedido confirmado:", response.data);
      toast.success("¡Pedido confirmado y enviado a preparación!");
   
      await refrescarCarrito(); 
      setCliente(null); 

    } catch (error: any) {
      
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.detail || JSON.stringify(error.response.data);
        toast.error(`Error de validación: ${errorMessage}`);
      } else {
        console.error("Error al confirmar el pedido:", error);
        toast.error("No se pudo confirmar el pedido. Intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

   const handleModificarExtras = async (itemId: number, nuevosExtraIds: number[]) => {
    try {
      const carritoActualizado = await modificarExtras(itemId, nuevosExtraIds);
      await refrescarCarrito();
      toast.success("Extras actualizados.");
    } catch (error) {
        toast.error("No se pudieron modificar los extras.");
    }
  };

   const handleAgregarExtra = (item: ItemCarrito, extra: ExtraDisponible) => {
      const nuevosExtrasIds = [...item.extras.map(e => e.id), extra.id];
      handleModificarExtras(item.id, nuevosExtrasIds);
  };

 const handleEliminarCarrito = async () => {
    try {
      await eliminarCarrito();
      await refrescarCarrito();
      toast.success("Pedido limpiado.");
      setCliente(null);
      setNitInput('');
      setClienteNit(null);
    } catch (error) {
      toast.error("No se pudo limpiar el pedido.");
    }
  };

 const asignarClienteYRestaurarCarrito = async (clienteParaAsignar: UsuarioNit) => {
    setIsAssigningClient(true);
    toast.loading('Asignando cliente y productos...');

 
    const itemsParaRestaurar = carrito?.items ? [...carrito.items] : [];

    try {
    
      const carritoActual = await obtenerCarrito();
      if (!carritoActual?.id) {
       
        await refrescarCarrito();
      } else {
        await asignarCarritoACliente(carritoActual.id, clienteParaAsignar.id);
      }
      
      
      await refrescarCarrito();

      if (itemsParaRestaurar.length > 0) {
        for (const item of itemsParaRestaurar) {
      
          const extraIds = item.extras.map(extra => extra.id);
          await agregarProductoAlCarrito(item.producto_id, item.cantidad, extraIds);
        }
      }

     
      await refrescarCarrito();
      
      setCliente(clienteParaAsignar);
      toast.dismiss();
      toast.success(`Cliente '${clienteParaAsignar.apell_paterno}' asignado. Productos restaurados.`);
      
     
      setMostrarModalNIT(false);
      setClienteNoEncontrado(false);
      setNitInput('');
      setClienteNit(null);

    } catch (error) {
      toast.dismiss();
      toast.error("No se pudo asignar el cliente o restaurar los productos.");
      console.error("Error en asignación:", error);
    } finally {
      setIsAssigningClient(false);
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
        await asignarClienteYRestaurarCarrito(nuevoCliente);
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

      {items.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="p-4 text-center text-gray-400">
            El pedido está vacío. <br /> Añade productos del catálogo.
          </p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto mb-3 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}>
          {items.map((item) => (
            <div key={item.producto_id} className="border-b py-2.5 last:border-b-0">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-semibold text-sm text-gray-700 leading-tight">{item.nombre}</p>
                  <p className="text-xs text-gray-500">Bs. {item.precio_unitario.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleQuitarProducto(item.id)}
                  className="text-red-500 hover:text-red-700 text-lg font-semibold p-0 leading-none"
                >
                  ×
                </button>

              </div>
              <div className="flex items-center">
                <button
                 onClick={() => handleModificarCantidad(item.id, item.cantidad - 1)}
                  disabled={item.cantidad <= 1}
                  className="px-2 py-0.5 border rounded-l bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700"
                >
                  -
                </button>
                <span className="px-3 py-0.5 border-t border-b text-gray-700 text-sm">{item.cantidad}</span>
                <button
                onClick={() => handleModificarCantidad(item.id, item.cantidad + 1)}
                  className="px-2 py-0.5 border rounded-r bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  +
                </button>
                <p className="ml-auto font-semibold text-sm text-gray-700">
                  Bs. {(item.precio_unitario * item.cantidad).toFixed(2)}
                </p>
              </div>

 {item.extras.length > 0 && (
                <div>
                  {item.extras.map((extra: Extra) => (
                    <div key={`${item.id}-${extra.id}`}>
            
                      <span>+ {extra.name} (Bs. {extra.precio.toFixed(2)})</span>
                      <button
                        onClick={() => {
                          const nuevosExtrasIds = item.extras
                            .filter(e => e.id !== extra.id)
                            .map(e => e.id); 
                          handleModificarExtras(item.id, nuevosExtrasIds); 
                        }}
                        className="..."
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

    {extrasDisponibles.filter(extra => !item.extras.some(e => e.id === extra.id)).length === 0 ? (
      <p className="text-xs text-gray-400">Todos los extras ya fueron agregados.</p>
    ) : (
      extrasDisponibles
        .filter(extra => !item.extras.some(e => e.id === extra.id))
        .map(extra => (
          <button
            key={`disp-${item.producto_id}-${extra.id}`}
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

            {clienteNit ? (
              // Vista cuando el cliente es encontrado
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
                      // Llama a la función centralizada que maneja todo
                      await asignarClienteYRestaurarCarrito(clienteNit);
                    }}
                    disabled={isAssigningClient}
                    className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {isAssigningClient ? 'Asignando...' : 'Confirmar Cliente'}
                  </button>
                </div>
              </>
            ) : !clienteNoEncontrado ? (
              // Vista de búsqueda inicial
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setMostrarModalNIT(false)}
                  className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={buscarClientePorNIT}
                  disabled={isAssigningClient}
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Buscar
                </button>
                <button
                  onClick={async () => {
                    try {
                      const clienteLocal = await buscarClienteApi('7777777'); // NIT local fijo
                      await asignarClienteYRestaurarCarrito(clienteLocal); // <-- Usamos la función centralizada
                    } catch (error) {
                      toast.error("No se pudo asignar el cliente LOCAL");
                    }
                  }}
                  disabled={isAssigningClient}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded disabled:bg-gray-400"
                >
                  {isAssigningClient ? '...' : 'Usar Cliente LOCAL'}
                </button>
              </div>
            ) : (
              // Vista si no se encontró el cliente
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
                    disabled={isAssigningClient}
                    className="w-full bg-[#543F1D] hover:bg-amber-700 text-white py-1.5 rounded disabled:bg-gray-400"
                  >
                    {isAssigningClient ? 'Registrando...' : 'Registrar con este NIT'}
                  </button>
                  <button
                    onClick={() => {
                      setClienteNit(null);
                      setClienteNoEncontrado(false);
                    }}
                    disabled={isAssigningClient}
                    className="w-full bg-[#FE9A00] hover:bg-amber-700 text-white py-1.5 rounded disabled:bg-gray-400"
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

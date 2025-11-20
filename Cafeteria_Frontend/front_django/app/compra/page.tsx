'use client';
import { useEffect, useState } from 'react';
import {QRCodeSVG} from 'qrcode.react';
import Link from 'next/link';
import Menu from './../components/Menu.jsx';
import TipoPago from '../components/TipoPago';
import PantallaPreparando from '../components/PantallaPreprando';
import axios from 'axios';
import { useRouter } from 'next/navigation'; 
import toast, { Toaster } from 'react-hot-toast';
import "./menu.css"
import {
  obtenerCarrito,
  modificarCantidad,
  modificarExtras,
   quitarProducto,
    eliminarCarrito,
    Carrito,
    Extra,
    ItemCarrito
} from '@/app/api/Carrito';
import './compra.css';


/*
interface ExtraCarrito {
  extraId: number;
  nombre: string;
  precio: number;
}

interface ItemCarrito {
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

interface Carrito {
  id?: string;
  clienteId?: number;
  items: ItemCarrito[];
}*/



export const obtenerExtrasDisponibles = async (): Promise<Extra[] | null | { error: string }> => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/extras/`, {
      withCredentials: true
    });

    if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
      return null; 
    }

    const adaptados: Extra[] = res.data.map((e: any) => ({
      id: e.id,
      name: e.nombre,
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

const esCafe = (nombre: string) => {
  const claves = ['café', 'cafe'];
  const nombreNormalizado = nombre.toLowerCase();
  return claves.some(clave => nombreNormalizado.includes(clave));
};


export default function HomePage() {

  const [extrasDisponibles, setExtrasDisponibles] = useState<Extra[]>([]);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);

const [tipoEntrega, setTipoEntrega] = useState('');
const [showPreparando, setShowPreparando] = useState(false);
const [tarjeta, setTarjeta] = useState('');
const [tarjetaValida, setTarjetaValida] = useState(true);
const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const handleGenerarFactura = () => {
    // Puedes implementar la generación de PDF aquí
  };


const validarTarjeta = (numero: string) => {
  return /^\d{16}$/.test(numero);
};

  
const router = useRouter();
  const confirmarPedido = async () => {

    if (!metodoPagoSeleccionado) {
  toast.error("⚠️ Debes seleccionar un método de pago.");
  return false;
}

    if (!tipoEntrega) {
    toast.error("⚠️ Debes seleccionar un tipo de entrega.");
    return false;
  }

  if (metodoPagoSeleccionado === 'Tarjeta de crédito/débito' && !validarTarjeta(tarjeta)) {
    toast.error("⚠️ Número de tarjeta inválido.");
    return false;
  }

  if (!carrito || !carrito.id) {
    toast.error("⚠️ Carrito no disponible. Por favor, actualiza la página.");
    return false;
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/Pedido/confirmar`,
      
      null,
      {
        params: {
          carritoId: carrito.id,
          tipoEntrega: tipoEntrega,
          Tipo_pago:metodoPagoSeleccionado
        },
        withCredentials: true
      }
    ); 
    const { pedido_id, total_estimado, total_descuento } = response.data;
    console.log("Pedido confirmado:", { pedido_id, total_estimado, total_descuento });
    setShowPreparando(true);
    return true;
  } catch (error: any) {
    console.error("Error al confirmar el pedido:", error);
    toast.error("No se pudo confirmar el pedido. Intenta de nuevo.");
  }
};
 useEffect(() => {
  const fetchExtras = async () => {
    try {
      const data = await obtenerExtrasDisponibles();

      if (!data || 'error' in data) {
        if (data && data.error === 'NO_AUTORIZADO') {
          router.push('/menu');
        }
        return; 
      }

      setExtrasDisponibles(data); 
    } catch (error) {
      console.error("Error al obtener extras disponibles:", error);
    }
  };

  fetchExtras();
}, []);


  useEffect(() => {
  

const fetchCarrito = async () => {
  try {
    const data = await obtenerCarrito();
    

    if (!data || 'error' in data) {
      console.warn('Usuario no autorizado. Redirigiendo a registro...');
      router.push('/menu'); 
      return;
    }

    setCarrito(data); 
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
  } finally {
    setLoading(false);
  }
};


  fetchCarrito();
}, []);


  const totalItems = carrito?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  const totalAmount =
    carrito?.items?.reduce((sum, item) => {
      const precio = item.precio_promocional ?? item.precio_unitario;
      const extras = item.extras?.reduce((s, e) => s + e.precio, 0) || 0;
      return sum + (precio + extras) * item.cantidad;
    }, 0) || 0;


  const handleModificarCantidad = async (item: ItemCarrito, nuevaCantidad: number) => {
  try {
    const extraIds = item.extras.map(e => e.id);
    await modificarCantidad(item.producto_id, nuevaCantidad);

    const actualizado = await obtenerCarrito();

    if (!actualizado || 'error' in actualizado) {
      router.push('/menu');
      return;
    }

    setCarrito(actualizado);
  } catch (error) {
    console.error("Error al modificar cantidad:", error);
  }
};


  const handleAgregarExtra = async (item: ItemCarrito, extra: Extra) => {
  try {
    const nuevosExtras = [...item.extras, extra];
    const nuevosExtrasIds = nuevosExtras.map(e => e.id);
    await modificarExtras(item.producto_id, nuevosExtrasIds);

    const actualizado = await obtenerCarrito();

    if (!actualizado || 'error' in actualizado) {
      router.push('/menu');
      return;
    }

    setCarrito(actualizado);
  } catch (error) {
    console.error("Error al agregar extra:", error);
  }
};


  const handleQuitarExtra = async (item: ItemCarrito, extraId: number) => {
  try {
    const nuevosExtras = item.extras.filter(e => e.id !== extraId);

    const nuevosExtrasIds = nuevosExtras.map(e => e.id);

    await modificarExtras(item.producto_id, nuevosExtrasIds);

    const actualizado = await obtenerCarrito();

    if (!actualizado || 'error' in actualizado) {
      router.push('/menu');
      return;
    }

    setCarrito(actualizado);
  } catch (error) {
    console.error("Error al quitar extra:", error);
  }
};


  return (
    <div className="page-container">
      <Toaster position="top-right" />
      <Menu/>

      <div className="flex-1 p-8 max-w-4xl mx-auto w-full transition-opacity duration-300">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-9 p-4 bg-neutral-900 rounded-lg shadow-sm pt-[80px]">

          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8M7 13h10m0 0l1.6 8M6 21a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
            <span className="ml-2 text-lg font-semibold">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <div className="text-xl font-bold text-amber-700">
            Total: {totalAmount.toFixed(2)}Bs
          </div>
        </div>

        {/* Productos */}
        <div className="border-b pb-6 space-y-4">
          <h3 className="text-xl font-semibold mb-4">Tus productos</h3>
          {loading ? (
            <p className="text-gray-500">Cargando productos...</p>
          ) : carrito?.items?.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío.</p>
          ) : (
            carrito?.items?.map((item, index) => {
              const precio = item.precio_promocional ?? item.precio_unitario;
              const extras = item.extras?.reduce((s, e) => s + e.precio, 0) || 0;
              const subtotal = (precio + extras) * item.cantidad;

              return (
                <div key={index} className="flex justify-between gap-4 items-start border-t pt-4">
                  <div className="flex-1">
                    <p className="font-medium text-base">{item.nombre}</p>

                    {/* Cantidad */}
                    <div className="flex items-center gap-2 my-2">
                      <button
                        onClick={() => handleModificarCantidad(item, Math.max(1, item.cantidad - 1))}
                        className="producto-cantidad-boton"
                      >
                        -
                      </button>
                      <span className="font-semibold">{item.cantidad}</span>
                      <button
                        onClick={() => handleModificarCantidad(item, item.cantidad + 1)}
                        className="producto-cantidad-boton"
                      >
                        +
                      </button>
                    </div>

                    {/* Extras actuales */}
                    {item.extras?.length > 0 && (
                      <ul className="mt-1 ml-4 list-disc text-sm text-gray-600">
                        {item.extras.map(extra => (
                          <li key={`${item.producto_id}-${extra.id}`} className="flex justify-between items-center">
                            <span>{extra.name} (+${extra.precio.toFixed(2)})</span>
                            <button
                              onClick={() => handleQuitarExtra(item, extra.id)}
                              className="text-red-500 text-xs ml-4 hover:underline"
                            >
                              Quitar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Agregar extras si contiene café */}
                    {(esCafe(item.nombre) || esCafe(item.categoria))  && (
                          <div className="mt-2 ml-1 text-sm">
                            <p className="text-gray-700 font-semibold">Agregar extras:</p>
                            {extrasDisponibles
  .filter(extra => extra.id !== undefined && !item.extras.some(e => e.id === extra.id))

                              .map(extra => (
                                <div key={`${item.producto_id}-${extra.id}`}>
                                  <button
                                    onClick={() => handleAgregarExtra(item, extra)}
                                    className="text-amber-700 hover:underline block text-left"
                                  >
                                    {extra.name} (+Bs{extra.precio.toFixed(2)})
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}


                    {item.precio_promocional && (
                      <p className="text-sm text-amber-600 mt-1 italic">
                        Promoción: {item.descripcion_promocion}
                      </p>
                    )}
                  </div>
                  <p className="text-base font-bold text-gray-800 whitespace-nowrap">
                    Bs{subtotal.toFixed(2)}
                  </p>
                  <button
  onClick={async () => {
    try {
      await quitarProducto(
        item.producto_id
      );
      const actualizado = await obtenerCarrito();

if (!actualizado || 'error' in actualizado) {
  router.push('/menu');
  return;
}

if (actualizado.items.length === 0) {
  toast("🛒 Carrito vacío. Redirigiendo al menú...");
  router.push('/menu');
  return;
}

setCarrito(actualizado);

    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("No se pudo eliminar el producto. Intente nuevamente.");
    }
  }}
  className="mt-2 text-sm text-red-600 hover:underline"
>
  Eliminar producto
</button>

                </div>
              );
            })
          )}
        </div>

      {/* Tipo de entrega */}
<div className="border-t pt-6 space-y-3 mb-6">
  <h3 className="text-xl font-semibold mb-4">Tipo de entrega</h3>
  {[
    { label: 'Delivery', value: 'Delivery' },
    { label: 'Para Llevar', value: 'Llevar' },
  ].map(({ label, value }) => (
    <label key={value} className="flex items-center space-x-3">
      <input
        type="radio"
        name="entrega"
        value={value}
        checked={tipoEntrega === value}
        onChange={() => setTipoEntrega(value)}
        className="h-4 w-4 text-amber-600 focus:ring-amber-500"
      />
      <span>{label}</span>
    </label>
  ))}
</div>


{/* Método de pago */}
<div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Método de pago</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2 px-4 border border-gray-300 rounded-md text-left hover:bg-gray-50"
        >
          {metodoPagoSeleccionado || "Seleccionar método de pago..."}
        </button>
        
      </div>

      {/* Modal de tipo de pago */}
      <TipoPago
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentSelect={(metodo) => setMetodoPagoSeleccionado(metodo)}
      />

        {/* Total final */}
        <div className="flex justify-between items-center py-4 border-t border-b mt-6">
          <span className="text-lg font-semibold">Total real:</span>
          <span className="text-xl font-bold text-amber-700">{totalAmount.toFixed(2)}Bs</span>
        </div>

        {/* Eliminar Carrito */}
        {carrito?.id && (
                  <button
                    onClick={async () => {
                      try {
                        await eliminarCarrito();
                        toast.success("🗑️ Carrito eliminado correctamente");
                        setCarrito(null); 
                       router.push('/menu');
                      } catch {
                        toast.error("❌ No se pudo eliminar el carrito");
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                  >
                    Eliminar carrito completo
                  </button>
                )}



        {/* Confirmación */}
    
          <button
              type="button"
              onClick={async () => {
              const ok = await confirmarPedido(); 
              if(ok){
              setShowPreparando(true); 
              }
              
              }}
              className="w-full mt-6 bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02]"
            >
              CONFIRMAR COMPRA
            </button>

            <PantallaPreparando
                isOpen={showPreparando}
                onClose={() => setShowPreparando(false)}
                onGenerarFactura={handleGenerarFactura}
              />



     

        {/* Acceso alternativo */}
        <div className="fixed right-8 bottom-8 z-50 compra-btn">
          <Link href="/menu">
            <button className="bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">

              <svg  xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-amber-700" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor">
                
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8M7 13h10m0 0l1.6 8M6 21a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              VOLVER AL MENU
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

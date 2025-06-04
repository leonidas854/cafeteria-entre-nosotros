'use client';
import { useEffect, useState } from 'react';
import {QRCodeSVG} from 'qrcode.react';
import Link from 'next/link';
import Menu from './../components/Menu.jsx';
import axios from 'axios';
import { useRouter } from 'next/navigation'; 
import toast, { Toaster } from 'react-hot-toast';
import "./menu.css"
import {
  obtenerCarrito,
  modificarCantidad,
  modificarExtras,
   quitarProducto,
    eliminarCarrito
} from '@/app/api/Carrito';
import './compra.css';

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

const esCafe = (nombre: string) => {
  const claves = ['café', 'cafe'];
  const nombreNormalizado = nombre.toLowerCase();
  return claves.some(clave => nombreNormalizado.includes(clave));
};


export default function HomePage() {
  const [extrasDisponibles, setExtrasDisponibles] = useState<ExtraCarrito[]>([]);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(true);

const [tipoEntrega, setTipoEntrega] = useState('');
const [metodoPago, setMetodoPago] = useState('Tarjeta de crédito/débito');
const [tarjeta, setTarjeta] = useState('');
const [tarjetaValida, setTarjetaValida] = useState(true);

const validarTarjeta = (numero: string) => {
  return /^\d{16}$/.test(numero);
};

  
const router = useRouter();
  const confirmarPedido = async () => {
    if (!tipoEntrega) {
    toast.error("⚠️ Debes seleccionar un tipo de entrega.");
    return;
  }

  if (metodoPago === 'Tarjeta de crédito/débito' && !validarTarjeta(tarjeta)) {
    toast.error("⚠️ Número de tarjeta inválido.");
    return;
  }

  if (!carrito || !carrito.id) {
    toast.error("⚠️ Carrito no disponible. Por favor, actualiza la página.");
    return;
  }

  try {
    //const tipoEntrega = "Mesa"; 
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/Pedido/confirmar`,
      
      null,
      {
        params: {
          carritoId: carrito.id,
          tipoEntrega: tipoEntrega,
          Tipo_pago:metodoPago
        },
        withCredentials: true
      }
    );

    const { pedido_id, total_estimado, total_descuento } = response.data;

    console.log("Pedido confirmado:", { pedido_id, total_estimado, total_descuento });

    // Redirigir o mostrar un mensaje
    window.location.href = "/EstadoPedido"; 

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
          router.push('/registro');
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
      router.push('/registro'); 
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
      const precio = item.precioPromocional ?? item.precioUnitario;
      const extras = item.extras?.reduce((s, e) => s + e.precio, 0) || 0;
      return sum + (precio + extras) * item.cantidad;
    }, 0) || 0;


  const handleModificarCantidad = async (item: ItemCarrito, nuevaCantidad: number) => {
  try {
    const extraIds = item.extras.map(e => e.extraId);
    await modificarCantidad(item.productoId, extraIds, nuevaCantidad);

    const actualizado = await obtenerCarrito();

    if (!actualizado || 'error' in actualizado) {
      router.push('/registro');
      return;
    }

    setCarrito(actualizado);
  } catch (error) {
    console.error("Error al modificar cantidad:", error);
  }
};


  const handleAgregarExtra = async (item: ItemCarrito, extra: ExtraCarrito) => {
  try {
    const nuevosExtras = [...item.extras, extra];
    await modificarExtras(item.productoId, nuevosExtras);

    const actualizado = await obtenerCarrito();

    if (!actualizado || 'error' in actualizado) {
      router.push('/registro');
      return;
    }

    setCarrito(actualizado);
  } catch (error) {
    console.error("Error al agregar extra:", error);
  }
};


  const handleQuitarExtra = async (item: ItemCarrito, extraId: number) => {
  try {
    const nuevosExtras = item.extras.filter(e => e.extraId !== extraId);
    await modificarExtras(item.productoId, nuevosExtras);

    const actualizado = await obtenerCarrito();

    if (!actualizado || 'error' in actualizado) {
      router.push('/registro');
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
              const precio = item.precioPromocional ?? item.precioUnitario;
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
                          <li key={`${item.productoId}-${extra.extraId}`} className="flex justify-between items-center">
                            <span>{extra.nombre} (+${extra.precio.toFixed(2)})</span>
                            <button
                              onClick={() => handleQuitarExtra(item, extra.extraId)}
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
  .filter(extra => extra.extraId !== undefined && !item.extras.some(e => e.extraId === extra.extraId))

                              .map(extra => (
                                <div key={`${item.productoId}-${extra.extraId}`}>
                                  <button
                                    onClick={() => handleAgregarExtra(item, extra)}
                                    className="text-amber-700 hover:underline block text-left"
                                  >
                                    {extra.nombre} (+Bs{extra.precio.toFixed(2)})
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}


                    {item.precioPromocional && (
                      <p className="text-sm text-amber-600 mt-1 italic">
                        Promoción: {item.descripcionPromocion}
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
        item.productoId,
        item.extras.map((e) => e.extraId)
      );
      const actualizado = await obtenerCarrito();

if (!actualizado || 'error' in actualizado) {
  router.push('/registro');
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
  {['Delivery', 'Llevar'].map((tipo) => (
    <label key={tipo} className="flex items-center space-x-3">
      <input
        type="radio"
        name="entrega"
        value={tipo}
        checked={tipoEntrega === tipo}
        onChange={() => setTipoEntrega(tipo)}
        className="h-4 w-4 text-amber-600 focus:ring-amber-500"
      />
      <span>{tipo}</span>
    </label>
  ))}
</div>

{/* Método de pago */}
<div className="border-t pt-6 space-y-3">
  <h3 className="text-xl font-semibold mb-4">Método de pago</h3>
  {["Tarjeta de crédito/débito", "Transferencia bancaria", "Generar QR"].map((label, idx) => (
    <label key={idx} className="flex items-center space-x-3">
      <input
        type="radio"
        name="payment"
        value={label}
        checked={metodoPago === label}
        onChange={() => {
          setMetodoPago(label);
          setTarjeta('');
          setTarjetaValida(true);
        }}
        className="h-4 w-4 text-amber-600 focus:ring-amber-500"
      />
      <span>{label}</span>
    </label>
  ))}

  {/* Campos condicionales */}
  <div className="mt-4 space-y-2">
    {metodoPago === "Tarjeta de crédito/débito" && (
      <div>
        <label className="block text-sm font-medium text-gray-700">Número de tarjeta</label>
        <input
          type="text"
          value={tarjeta}
          onChange={(e) => {
            const val = e.target.value;
            setTarjeta(val);
            setTarjetaValida(validarTarjeta(val));
          }}
          maxLength={16}
          className={`mt-1 block w-full border rounded-md px-3 py-2 ${tarjetaValida ? 'border-gray-300' : 'border-red-500'}`}
          placeholder="Ej: 1234567812345678"
        />
        {!tarjetaValida && <p className="text-red-500 text-sm mt-1">Tarjeta inválida (deben ser 16 dígitos)</p>}
      </div>
    )}

    {metodoPago === "Transferencia bancaria" && (
      <div>
        <p className="text-gray-700">Banco: Banco Union</p>
        <p className="text-gray-700">Cuenta N°: <strong>1234567890123456</strong></p>
      </div>
    )}

    {metodoPago === "Generar QR" && (
      <div className="bg-white p-4 inline-block rounded shadow-md">
        <img src="/shonow.jpg" alt="Código QR" className="mx-auto w-32 h-32" />
        <p className="text-center mt-2 text-sm text-gray-900">Escanea para pagar</p>
      </div>
    )}
  </div>
</div>


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
                        await eliminarCarrito(carrito.id!);
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
              onClick={confirmarPedido}
              className="w-full mt-6 bg-gradient-to-r from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02]"
            >
              Confirmar compra/venta
            </button>

     

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

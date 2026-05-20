'use client';
import { useEffect, useState } from 'react';
import {QRCodeSVG} from 'qrcode.react';
import Link from 'next/link';
import Menu from '@/src/shared/components/Menu.jsx';
import TipoPago from '@/src/shared/components/TipoPago';
import PantallaPreparando from '@/src/shared/components/PantallaPreprando';
import axios from 'axios';
import { useRouter } from 'next/navigation'; 
import toast, { Toaster } from 'react-hot-toast';
// Menu.jsx ahora importa su propio CSS (navbar.css)
import {
  obtenerCarrito,
  modificarCantidad,
  modificarExtras,
   quitarProducto,
    eliminarCarrito
} from '@/src/features/menu/api/Carrito';
import '@/src/features/compra/styles/compra.css';
import { CheckoutSummary } from '@/src/features/compra/components/CheckoutSummary';
import { CheckoutForm } from '@/src/features/compra/components/CheckoutForm';

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



const obtenerExtrasDisponibles = async (): Promise<ExtraCarrito[] | null | { error: string }> => {
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
      router.push('/menu');
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
    const nuevosExtras = item.extras.filter(e => e.extraId !== extraId);
    await modificarExtras(item.productoId, nuevosExtras);

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
        <CheckoutSummary
          loading={loading}
          carrito={carrito}
          setCarrito={setCarrito}
          esCafe={esCafe}
          handleModificarCantidad={handleModificarCantidad}
          handleQuitarExtra={handleQuitarExtra}
          handleAgregarExtra={handleAgregarExtra}
          extrasDisponibles={extrasDisponibles}
        />

        <CheckoutForm
          tipoEntrega={tipoEntrega}
          setTipoEntrega={setTipoEntrega}
          metodoPagoSeleccionado={metodoPagoSeleccionado}
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
          setMetodoPagoSeleccionado={setMetodoPagoSeleccionado}
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

'use client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {obtenerCarrito,
  agregarProductoAlCarrito , 
  ItemCarrito,
  Carrito,
  Extra

} from '@/app/api/Carrito';


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
}
*/
interface Props {
  carrito: Carrito | null;
  totalItems: number;
  totalAmount: number;
  actualizarCarrito: () => Promise<void>;
}

export default function CarritoFloatingLabel({
  carrito,
  totalItems,
  totalAmount,
  actualizarCarrito
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    
    if (!carrito || !carrito.items || carrito.items.length === 0 || totalItems === 0) {
      toast.error('⚠️ Tu carrito está vacío.');
      return;
    }

    router.push('/compra');
  };

  return (
    <div
      onClick={handleClick}
      className="fixed top-24 right-4 z-50 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 hover:bg-opacity-100 transition-all cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8M7 13h10m0 0l1.6 8M6 21a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z"
        />
      </svg>
      <span className="font-bold">{totalItems} items</span>
      <span className="font-bold text-amber-500">Bs{totalAmount.toFixed(2)}</span>
    </div>
  );
}
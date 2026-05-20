'use client';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import toast, { Toaster } from 'react-hot-toast';

import Menu from "@/src/shared/components/Menu.jsx";
import MenuLateral from "@/src/shared/components/MenuLateral.jsx";
import RecomendadosCarousel from '@/src/shared/components/RecomendadosCarousel';
import CarritoFlotante from '@/src/shared/components/CarritoFlotante';
import Bienvenida from '@/src/shared/components/Bienvenida';
import { ProductGrid } from '@/src/features/menu/components/ProductGrid';
import { useMenu } from '@/src/features/menu/hooks/useMenu';

// Menu.jsx ahora importa su propio CSS (navbar.css)
import "@/src/features/menu/styles/catalogo.css";

export default function HomePage() {
  const router = useRouter();
  const {
    loading,
    error,
    activeCategory,
    activeSubcategory,
    groupedProducts,
    carrito,
    mostrarBotonHistorial,
    totalItems,
    totalAmount,
    cargarCarrito,
    handleCategorySelect
  } = useMenu();

  if (loading) return <p className="p-8">Cargando productos...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      <Toaster position="top-right" />
      <Menu />
      <CarritoFlotante 
        carrito={carrito as any}
        totalItems={totalItems}
        totalAmount={totalAmount}
        actualizarCarrito={cargarCarrito}
      />
      <Bienvenida/>
      <div className="flex flex-1 pt-32 relative">
        <div className="fixed left-0 top-32 bottom-0 w-64 z-10">
          <MenuLateral 
            onSelectCategory={handleCategorySelect} 
            groupedProducts={groupedProducts as any} 
          />
        </div>

        <div className="flex-1 ml-64 p-8 overflow-y-auto">
          <RecomendadosCarousel 
            onSelectProduct={(producto: any) => {
              console.log("Recomendación clickeada:", producto);
              toast("Recomendación: " + producto.nombre);
            }}
            onCarritoUpdated={cargarCarrito}
          />
          <h1 className="text-4xl font-urwclassico mb-8">
            {activeCategory}
            {activeSubcategory && ` - ${activeSubcategory}`}
          </h1>
          <ProductGrid 
            groupedProducts={groupedProducts as any}
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            cargarCarrito={cargarCarrito}
            mostrarBotonHistorial={mostrarBotonHistorial}
          />
        </div>
      </div>

      {mostrarBotonHistorial && (
        <div className="fixed right-8 bottom-8 z-50 compra-btn">
          <Link href="/EstadoPedido">
            <button className="bg-slate-600 bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              HISTORIAL DE PEDIDOS
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

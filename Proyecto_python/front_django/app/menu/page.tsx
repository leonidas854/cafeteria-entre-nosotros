'use client';
import {obtenerCarrito,
  agregarProductoAlCarrito , 
  ItemCarrito,
  Carrito,
  Extra

} from '@/app/api/Carrito';
import { useEffect, useState } from 'react';
import { getProductos, Producto } from '@/app/api/productos';
import Menu from "../components/Menu.jsx";
import MenuLateral from "../components/MenuLateral";
import CarritoFlotante from '../components/CarritoFlotante';
import Bienvenida from '../components/Bienvenida';
import Link from "next/link";
import "./menu.css";
import "./catalogo.css";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';


export type GroupedProducts = {
  [categoria: string]: {
    subcategorias?: {
      [subcategoria: string]: Producto[];
    };
    sinSubcategoria?: Producto[]; 
  };
};


export default function HomePage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});

  const [carrito, setCarrito] = useState<Carrito | null>(null);
const [carritoCargando, setCarritoCargando] = useState(true);

const totalItems = carrito?.items.reduce((sum, item) => sum + item.cantidad, 0) || 0;
const totalAmount = carrito?.items.reduce((sum, item) => {
  const precio = item.precio_promocional ?? item.precio_unitario;
  const extras = item.extras?.reduce((eSum, e) => eSum + e.precio, 0) || 0;
  return sum + (precio + extras) * item.cantidad;
}, 0) || 0;


const [mostrarBotonHistorial, setMostrarBotonHistorial] = useState(false);




const cargarCarrito = async () => {
    try {
      const data = await obtenerCarrito();
      if (data && !('error' in data)) {
        setCarrito(data);
      } else {
        setCarrito(null);
      }
    } catch (err:any) {
      if(err.response?.status===403){
 setCarrito(null);
  console.error('Error al obtener el carrito:', err);
      }

     
     
    } finally {
      setCarritoCargando(false);
    }
  };
  const verificarPedidos = async () => {
  try {
    
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/pedidos/mis-pedidos/`, {
      withCredentials: true,
    });
    if (res.data.length >= 0&&Array.isArray(res.data)) {
      setMostrarBotonHistorial(true);
    } else {
      setMostrarBotonHistorial(false);
    }
  } catch (error: any) {
    if (error.response?.status === 403|| error.response?.status === 404) {
      setMostrarBotonHistorial(false);
      
    } else {
      console.error("Error al verificar pedidos:", error);
    }
  }
};

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getProductos();
        setProductos(data);
        const agrupado = agruparPorCategoria(data);
        setGroupedProducts(agrupado);
        setActiveCategory(null); 
        setActiveSubcategory(null);

      } catch (err) {
        setError('Error al cargar los productos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }; 

    
  cargarCarrito();
verificarPedidos();
    fetchProductos();
  }, []);
const agruparPorCategoria = (productos: Producto[]): GroupedProducts => {
  const agrupado: GroupedProducts = {};

  productos.forEach((producto) => {
    const categoria = producto.categoria?.trim();
    const subcategoria = producto.subcategoria?.trim();

    if (!categoria || categoria === "S/D") return;

    if (!agrupado[categoria]) {
      agrupado[categoria] = {};
    }

    // Si tiene subcategoría válida
    if (subcategoria && subcategoria !== "S/D") {
      if (!agrupado[categoria].subcategorias) {
        agrupado[categoria].subcategorias = {};
      }
      if (!agrupado[categoria].subcategorias![subcategoria]) {
        agrupado[categoria].subcategorias![subcategoria] = [];
      }
      agrupado[categoria].subcategorias![subcategoria].push(producto);
    } else {

      if (!agrupado[categoria].sinSubcategoria) {
        agrupado[categoria].sinSubcategoria = [];
      }
      agrupado[categoria].sinSubcategoria!.push(producto);
    }
  });

  return agrupado;
};



  const handleCategorySelect = (category: string, subcategory: string | null = null) => {
  setActiveCategory(category);
  setActiveSubcategory(subcategory);
};


const renderProducts = () => {
  // Si NO hay categoría seleccionada, mostrar TODO agrupado
  if (!activeCategory && !activeSubcategory) {
  // Mostrar TODO agrupado
  return Object.entries(groupedProducts).map(([categoria, grupo]) => (
    <div key={categoria} className="mb-16">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">{categoria}</h1>

      {grupo.sinSubcategoria && grupo.sinSubcategoria.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {grupo.sinSubcategoria.map((product) => (
           <ProductCard
  key={`${product.nombre}-${product.precio}`}
  product={product}
  cargarCarrito={cargarCarrito}
  mostrarBotonHistorial={mostrarBotonHistorial}
/>

          ))}
        </div>
      )}

      {grupo.subcategorias &&
        Object.entries(grupo.subcategorias).map(([sub, productos]) => (
          <div key={sub} className="mb-12">
            <h2 className="text-2xl font-semibold text-amber-600 mb-4">{sub}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productos.map((product) => (
                <ProductCard
  key={`${product.nombre}-${product.precio}`}
  product={product}
  cargarCarrito={cargarCarrito}
  mostrarBotonHistorial={mostrarBotonHistorial}
/>

              ))}
            </div>
          </div>
        ))}
    </div>
  ));
}


  const categoriaData = groupedProducts[activeCategory!];
  //if (!categoriaData) return <p>No hay productos en esta categoría.</p>;

  // Si también hay subcategoría seleccionada:
  if (activeSubcategory && categoriaData.subcategorias?.[activeSubcategory]) {
    const productos = categoriaData.subcategorias[activeSubcategory];
    return (
      <div className="mb-16">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">
          {activeCategory} - {activeSubcategory}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((product) => (
           <ProductCard
  key={`${product.nombre}-${product.precio}`}
  product={product}
  cargarCarrito={cargarCarrito}
  mostrarBotonHistorial={mostrarBotonHistorial}
/>

          ))}
        </div>
      </div>
    );
  }

  // Si solo hay categoría seleccionada y no hay subcategoría
  if (categoriaData.sinSubcategoria?.length) {
    return (
      <div className="mb-16">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">{activeCategory}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriaData.sinSubcategoria.map((product) => (
           <ProductCard
  key={`${product.nombre}-${product.precio}`}
  product={product}
  cargarCarrito={cargarCarrito}
  mostrarBotonHistorial={mostrarBotonHistorial}
/>

          ))}
        </div>
      </div>
    );
  }

  if (Object.keys(groupedProducts).length === 0) {
  return <p>No hay productos disponibles.</p>;
}


};





  if (loading) return <p className="p-8">Cargando productos...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;
  //if (!activeCategory) return <p className="p-8">No hay categorías disponibles</p>;

   // Reemplaza tu bloque return completo con este código
return (
    <div className="absolute inset-0 flex flex-col bg-black">
      <Toaster position="top-right" />
      <Menu />
      <CarritoFlotante
        carrito={carrito}
        totalItems={totalItems}
        totalAmount={totalAmount}
        actualizarCarrito={cargarCarrito}
      />
      <Bienvenida />

      {/* --- BOTÓN HAMBURGUESA PARA MÓVIL --- */}
      {/* Este botón solo será visible en pantallas pequeñas (lg:hidden) y abrirá el menú */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden p-2 bg-gray-800 text-white rounded-full shadow-lg fixed top-24 left-4 z-50"
        aria-label="Abrir menú de categorías"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* --- CONTENEDOR PRINCIPAL DEL LAYOUT --- */}
      <div className="flex flex-1 pt-20 relative"> {/* pt-20 para la altura del menú superior */}

        {/* --- MENÚ LATERAL RESPONSIVO --- */}
        {/* Overlay que aparece en móvil para cerrar el menú al tocar fuera */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* El contenedor del menú lateral no cambia, su lógica ya era correcta */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:pt-20`} // lg:pt-20 para alinear bajo el menú superior
        >
          <MenuLateral
            onSelectCategory={handleCategorySelect}
            groupedProducts={groupedProducts}
            onClose={() => setIsSidebarOpen(false)}
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
          />
        </div>

        {/* --- CONTENIDO PRINCIPAL DE PRODUCTOS --- */}
        {/* 
          * SOLUCIÓN AL BUG PRINCIPAL:
          * `ml-0`: En móvil, el margen izquierdo es CERO. No más barra negra.
          * `lg:ml-64`: SOLO en pantallas grandes, se aplica el margen para el menú lateral.
        */}
        <main className="flex-1 ml-0 lg:ml-64 p-4 md:p-8 overflow-y-auto transition-all duration-300">
          <h1 className="text-3xl md:text-4xl font-urwclassico mb-8 text-white">
            {activeCategory ? (activeSubcategory ? `${activeCategory} - ${activeSubcategory}` : activeCategory) : 'Nuestro Menú'}
          </h1>
          {renderProducts()}
        </main>
      </div>

      {/* --- BOTÓN DE HISTORIAL DE PEDIDOS --- */}
      {/* (Limpiado para evitar duplicados) */}
      {mostrarBotonHistorial && (
        <div className="fixed right-8 bottom-8 z-20">
          <Link href="/EstadoPedido">
            <button className="bg-slate-600 bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>HISTORIAL</span>
            </button>
          </Link>
        </div>
      )}
    </div>
  );

}
export function ProductCard({
  product,
  cargarCarrito,
  mostrarBotonHistorial
}: {
  product: Producto;
  cargarCarrito: () => void;
  mostrarBotonHistorial: boolean;
}) {

  const [showDescription, setShowDescription] = useState(false);
  const [loading, setLoading] = useState(false);




  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await agregarProductoAlCarrito(
        product.id,
        1,
        []
      );
     const carrito = await obtenerCarrito();

    
    if (carrito && typeof carrito === 'object' && 'error' in carrito && carrito.error === 'NO_AUTORIZADO') {
      toast.error('⚠️ Sesión expirada. Por favor, inicia sesión.');
      return;
    }

    toast.success('✅ Producto añadido al carrito');
     await cargarCarrito();
  } catch (error: any) {
   
    if (error?.response?.status === 401) {
      toast.error('⚠️ No autorizado. Inicia sesión.');
    } else {
      toast.error('❌ Error al añadir producto');
    }
  } finally {
    setLoading(false);
  }
  };

  return (
    <div
      className="product-card bg-[#F2EEEB] rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setShowDescription(true)}
      onMouseLeave={() => setShowDescription(false)}
    >
      <div className="relative h-68 bg-gray-200 overflow-hidden">
        {product.imagen_url && (
          <img
            src={
              typeof product.imagen_url === 'string'
                ? product.imagen_url
                : URL.createObjectURL(product.imagen_url)
            }
            alt={product.nombre}
            className="w-full h-full object-cover"
            style={{
            objectFit: 'fill', 
            objectPosition: 'center', 
            maxHeight: '600px',
            width: '400%' 
      }}
          />
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {product.sabores &&
            product.sabores.split(',').map((label, index) => (
              <span key={index} className="bg-amber-600 text-white text-xs px-2 py-1 rounded">
                {label.trim()}
              </span>
            ))}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 text-gray-900">
          {product.nombre || 'Producto sin nombre'}</h3>
        <p className="text-amber-700 font-bold text-xl mb-2">Bs.{product.precio.toFixed(2)}</p>

        <div className={`overflow-hidden transition-all duration-300 ${showDescription ? 'max-h-40' : 'max-h-0'}`}>
          <p className="text-gray-600 text-sm">{product.descripcion}</p>

          <button
            onClick={handleAddToCart}
            className="mt-3 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Añadir al carrito'}
          </button>
        </div>
      </div>



      


    </div>
  );
}
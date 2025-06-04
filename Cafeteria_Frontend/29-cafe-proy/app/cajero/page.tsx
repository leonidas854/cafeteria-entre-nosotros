// app/cajero/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

import { getProductos, Producto, getProductoPorId} from '@/app/api/productos';
import { logout} from '@/app/api/CerrarSesC';
import { getUsuarioAutenticado} from '@/app/api/LoginEmpleado';
import { getPromociones, Promocion } from '@/app/api/Promociones';
import { ItemPedido, GroupedProducts } from './type';

import CajeroHeader from './componentess/CajeroHeader';
import ProductCardCajero from './componentess/ProductCardCajero';
import CurrentOrderDisplay from './componentess/CurrentOrderDisplay';
import CategoryFilterPanel from './componentess/CategoryFilterPanel';

import { UsuarioNit } from './componentess/CurrentOrderDisplay';

import { agregarProductoAlCarrito } from '@/app/api/Carrito';

import { obtenerCarrito } from '@/app/api/Carrito';




export default function CajeroPage() {
  const router = useRouter();
  const [items, setItems] = useState<ItemPedido[]>([]);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProducts>({});

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);



  

const [promociones, setPromociones] = useState<(Promocion & { productosDetallados: Producto[] })[]>([]);

const [loadingPromo, setLoadingPromo] = useState(true);

  const [currentOrderItems, setCurrentOrderItems] = useState<ItemPedido[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
const [productosPromoListos, setProductosPromoListos] = useState<Producto[]>([]);

const [clienteActual, setClienteActual] = useState<UsuarioNit | null>(null);

  const agruparPorCategoria = useCallback((productosList: Producto[]): GroupedProducts => {
    const agrupado: GroupedProducts = {};
    productosList.forEach((producto) => {
      const categoria = producto.categoria?.trim();
      const subcategoria = producto.sub_categoria?.trim();
      if (!categoria || categoria === "S/D") return;
      if (!agrupado[categoria]) agrupado[categoria] = {};
      if (subcategoria && subcategoria !== "S/D") {
        if (!agrupado[categoria].subcategorias) agrupado[categoria].subcategorias = {};
        if (!agrupado[categoria].subcategorias![subcategoria]) agrupado[categoria].subcategorias![subcategoria] = [];
        agrupado[categoria].subcategorias![subcategoria].push(producto);
      } else {
        if (!agrupado[categoria].sinSubcategoria) agrupado[categoria].sinSubcategoria = [];
        agrupado[categoria].sinSubcategoria!.push(producto);
      }
    });
    return agrupado;
  }, []);

  const refrescarCarrito = async () => {
  const carrito = await obtenerCarrito();
  if (carrito && carrito.items) {
    setCurrentOrderItems(carrito.items);
  } else {
    setCurrentOrderItems([]);
  }
};



   useEffect(() => {
    const validarSesion = async () => {
      try {
        await getUsuarioAutenticado();
      } catch {
        toast.error("Debe iniciar sesión para acceder.");
        router.push('/login');
        return;
      }
      const cargarCarrito = async () => {
    const carrito = await obtenerCarrito();
    if (carrito && carrito.items) {
      setItems(carrito.items);
    }
  };

  cargarCarrito();
refrescarCarrito();
      await fetchProductos();
      await fetchPromos();
    };

    const fetchProductos = async () => {
      try {
        setLoadingProductos(true);
        const data = await getProductos();
        setProductos(data);
        setGroupedProducts(agruparPorCategoria(data));
      } catch (error) {
        toast.error('Error al cargar productos.');
      } finally {
        setLoadingProductos(false);
      }
    };

    const fetchPromos = async () => {
  try {
    const promos = await getPromociones();
    const ahora = new Date();

    const promocionesConProductos = await Promise.all(
      promos
        .filter(promo => new Date(promo.fech_ini) <= ahora && new Date(promo.fecha_final) >= ahora)
        .map(async (promo) => {
          const productosDetallados = await Promise.all(
            promo.productos.map(async (id) => {
              try {
                return await getProductoPorId(id);
              } catch {
                return null;
              }
            })
          );

          return {
            ...promo,
            productosDetallados: productosDetallados.filter((p): p is Producto => p !== null),
          };
        })
    );

    setPromociones(promocionesConProductos);
  } catch (error) {
    toast.error('Error al cargar promociones.');
  } finally {
    setLoadingPromo(false);
  }
};


    validarSesion();
  }, [agruparPorCategoria]);


 const handleLogout = async () => {
  try {
    await logout(); 
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  } finally {
    localStorage.removeItem('usuario');
    toast.success('Sesión cerrada.');
    router.push('/login');
  }
};

const handleAgregarPromo = async (productoIds: number[]) => {
  try {
    const productos = await Promise.all(
      productoIds.map(async (id) => {
        try {
          return await getProductoPorId(id);
        } catch {
          return null; 
        }
      })
    );

    for (const producto of productos.filter((p): p is Producto => p !== null)) {
      try {
         
        await agregarProductoAlCarrito(
          producto.id,
          producto.nombre,
          producto.categoria,
          producto.precio,
          1,
          [], 
          clienteActual?.id
        );

        await refrescarCarrito();
      } catch (error) {
        console.error(`Error al agregar producto ${producto.nombre}:`, error);
      }
    }

    toast.success("Productos promocionales añadidos al carrito.");
  } catch (error) {
    toast.error("Error al agregar productos de la promoción.");
    console.error(error);
  }
};




  const handleCategorySelect = (category: string | null, subcategory: string | null = null) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
  };

 const handleAddToOrder = async (product: Producto, quantity: number) => {
  try {
    const  ClienteId = clienteActual?.id; 

    await agregarProductoAlCarrito(
      product.id,
      product.nombre,
      product.categoria,
      product.precio,
      quantity,
      [], 
       ClienteId
    );

    toast.success(`${product.nombre} añadido al carrito`);
     await refrescarCarrito();
  } catch (error) {
    toast.error('Error al agregar producto al carrito.');
    console.error(error);
  }
};

  const handleUpdateOrderItemQuantity = (productoId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveOrderItem(productoId);
      return;
    }
    setCurrentOrderItems(prevItems =>
      prevItems.map(item =>
        item.productoId === productoId ? { ...item, cantidad: newQuantity } : item
      )
    );
  };

  const handleRemoveOrderItem = (productoId: number) => {
    setCurrentOrderItems(prevItems =>
      prevItems.filter(item => item.productoId !== productoId)
    );
    toast.error('Producto eliminado.');
  };

  const handleClearOrder = () => {
    setCurrentOrderItems([]);
   
  };

  

  const getFilteredProducts = (): { list: Producto[], title: string } => {
    if (loadingProductos) return { list: [], title: "Cargando..." };
    if (errorProductos) return { list: [], title: "Error al cargar" };
    if (Object.keys(groupedProducts).length === 0 && !loadingProductos) return { list: [], title: "No hay productos" };

    if (activeCategory === "Promociones") {
  return { list: [], title: "Promociones Activas" }; 
}


    let productsToRender: Producto[] = [];
    let title = "Todos los Productos";

    if (activeCategory) {
      const categoriaData = groupedProducts[activeCategory];
      if (categoriaData) {
        title = activeCategory;
        if (activeSubcategory && categoriaData.subcategorias?.[activeSubcategory]) {
          productsToRender = categoriaData.subcategorias[activeSubcategory];
          title += ` - ${activeSubcategory}`;
        } else {
          if (categoriaData.sinSubcategoria) productsToRender.push(...categoriaData.sinSubcategoria);
          if (categoriaData.subcategorias) {
            Object.values(categoriaData.subcategorias).forEach(subArray => productsToRender.push(...subArray));
          }
        }
      }
    } else {
      Object.values(groupedProducts).forEach(grupo => {
        if (grupo.sinSubcategoria) productsToRender.push(...grupo.sinSubcategoria);
        if (grupo.subcategorias) {
          Object.values(grupo.subcategorias).forEach(subArray => productsToRender.push(...subArray));
        }
      });
    }

    return { list: productsToRender, title };
  };


  const { list: filteredProductsList, title: productListTitle } = getFilteredProducts();

  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Toaster position="top-right" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}/>
      <CajeroHeader onLogout={handleLogout} />

      <div className="flex flex-1 pt-20" style={{ height: 'calc(100vh - 80px)' }}> {/* Altura del header 80px */}
        <CategoryFilterPanel
          groupedProducts={groupedProducts}
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          onSelectCategory={handleCategorySelect}
          isLoading={loadingProductos}
          promociones={promociones}
          loadingPromo={loadingPromo}
          
        />

        

        {/* Productos: ml-56 (ancho del CategoryFilterPanel) mr-80 (ancho del CurrentOrderDisplay) */}
        <main
  className="flex-1 p-4 overflow-y-auto"
  style={{ marginLeft: '14rem', marginRight: '20rem', scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}
>
  {loadingProductos && <p className="p-8 text-center text-gray-300 text-lg">Cargando productos...</p>}
  {errorProductos && <p className="p-8 text-center text-red-400 text-lg">{errorProductos}</p>}
  {!loadingProductos && !errorProductos && (
    <>
      <h2 className="text-2xl font-bold text-amber-500 mb-4">{productListTitle}</h2>

      {activeCategory === "Promociones" ? (
        loadingPromo ? (
          <p className="text-center text-gray-400">Cargando promociones...</p>
        ) : promociones.length === 0 ? (
          <p className="text-center text-gray-400">No hay promociones activas.</p>
        ) : (
          <div className="space-y-6">
            {promociones.map((promo, idx) => (
              <div key={idx} className="bg-white text-gray-800 rounded-lg shadow-md p-4">
                {promo.full_image_url && (
                  <img
                    src={promo.full_image_url}
                    alt="Imagen promoción"
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-amber-600">{promo.strategykey}</h3>
                <p className="text-sm text-gray-700">{promo.descripcion}</p>
                <p className="text-sm text-gray-500 mb-2">
                  Descuento: <strong>{promo.descuento}%</strong>
                </p>

                <ul className="text-sm mb-3">
                  {promo.productosDetallados.map((producto) => (
                    <li key={producto.id} className="flex justify-between items-center border-b border-gray-200 py-1">
                      <span className="text-gray-800">{producto.nombre}</span>
                      <span className="text-red-500 line-through text-xs mr-2">
                        {producto.precio.toFixed(2)} Bs
                      </span>
                      <span className="text-green-600 font-semibold text-sm">
                        {(producto.precio * (1 - promo.descuento / 100)).toFixed(2)} Bs
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleAgregarPromo(promo.productos)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 text-sm font-semibold rounded"
                >
                  Añadir productos de la promoción
                </button>
              </div>
            ))}
          </div>
        )
      ) : filteredProductsList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProductsList.map((product) => (
            <ProductCardCajero
              key={product.id || `${product.nombre}-${product.precio}`}
              product={product}
              onAddToOrder={handleAddToOrder}
            />
          ))}
        </div>
      ) : (
        <p className="p-8 text-center text-gray-300 text-lg">No hay productos que coincidan con la selección.</p>
      )}
    </>
  )}
</main>


        {/* Pedido Actual: w-80 (20rem) */}


       <aside className="w-80 bg-gray-800 p-1 fixed top-20 bottom-0 right-0 overflow-hidden shadow-lg">
  <div className="h-full overflow-y-auto space-y-4 px-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1F2937' }}>
    {/* Pedido Actual */}

   <CurrentOrderDisplay
  items={currentOrderItems}
  onUpdateQuantity={refrescarCarrito}
  onRemoveItem={refrescarCarrito} 
  onClearOrder={handleClearOrder}
  isSubmitting={isSubmittingOrder}
  cliente={clienteActual}
  setCliente={setClienteActual}
/>




    
  </div>
</aside>


      </div>
      

    </div>
  );
}




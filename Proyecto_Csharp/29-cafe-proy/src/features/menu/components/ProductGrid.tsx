import { ProductCard } from './ProductCard';
import { Producto } from '@/src/features/menu/api/productos';

type GroupedProducts = {
  [categoria: string]: {
    subcategorias?: {
      [subcategoria: string]: Producto[];
    };
    sinSubcategoria?: Producto[]; 
  };
};

interface ProductGridProps {
  groupedProducts: GroupedProducts;
  activeCategory: string | null;
  activeSubcategory: string | null;
  cargarCarrito: () => void;
  mostrarBotonHistorial: boolean;
}

export function ProductGrid({
  groupedProducts,
  activeCategory,
  activeSubcategory,
  cargarCarrito,
  mostrarBotonHistorial
}: ProductGridProps) {
  
  if (Object.keys(groupedProducts).length === 0) {
    return <p>No hay productos disponibles.</p>;
  }

  // Si NO hay categoría seleccionada, mostrar TODO agrupado
  if (!activeCategory && !activeSubcategory) {
    return (
      <>
        {Object.entries(groupedProducts).map(([categoria, grupo]) => (
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
        ))}
      </>
    );
  }

  const categoriaData = groupedProducts[activeCategory!];
  if (!categoriaData) return null;

  // Si también hay subcategoría seleccionada:
  if (activeSubcategory && categoriaData.subcategorias?.[activeSubcategory]) {
    const productos = categoriaData.subcategorias[activeSubcategory];
    return (
      <div className="mb-16">
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

  return null;
}

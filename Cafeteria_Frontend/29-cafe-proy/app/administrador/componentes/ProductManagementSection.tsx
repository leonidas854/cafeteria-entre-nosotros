'use client';

import ProductForm from './ProductForm';
import { Producto } from '@/app/api/productos';


interface ProductManagementSectionProps {
  productToEdit: Producto | null;
  onUpdateComplete: () => void;
  onCancelEdit: () => void;
}



export default function ProductManagementSection({
  productToEdit,
  onUpdateComplete,
  onCancelEdit,
}: ProductManagementSectionProps) {


  const isEditMode = !!productToEdit;
  return (
    <section id="prod" className="prod w-full">
      <div className="container mx-auto flex flex-col lg:flex-row overflow-hidden rounded-4xl shadow-lg">
        {/* Contenedor izquierdo - Formulario */}
        <div className="CONIZ_PROD w-full lg:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4 text-[#fff9e1]">AGREGAR PRODUCTO</h2>
           <ProductForm
            productToEdit={productToEdit}
            onUpdateComplete={onUpdateComplete}
            onCancelEdit={onCancelEdit}
          />
        </div>

        {/* Contenedor derecho con fondo y curvas */}
        <div className="CONDER_PROD w-full lg:w-1/2 p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#fff9e1', zIndex: 3 }}>
              PRODUCTOS
            </h2>
             <p className="text-xl max-w-2xl" style={{ color: '#fff9e1', zIndex: 3 }}>
              {isEditMode
                ? 'Modifique los detalles del producto seleccionado.'
                : 'Usted puede agregar un nuevo producto al catálogo.'
              }
            </p>
          </div>
        </div>


      </div>
    </section>
  );
}

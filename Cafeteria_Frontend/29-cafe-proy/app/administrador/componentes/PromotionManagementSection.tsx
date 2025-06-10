// app/admin/components/PromotionManagementSection.tsx
'use client';

import PromotionForm from './PromotionForm';
import { Promocion2 } from '@/app/api/Promociones';

interface PromotionManagementSectionProps {
  promotionToEdit: Promocion2 | null;
  onUpdateComplete: () => void;
  onCancelEdit: () => void;
}

export default function PromotionManagementSection({
  promotionToEdit,
  onUpdateComplete,
  onCancelEdit
}: PromotionManagementSectionProps) {

  const isEditMode = !!promotionToEdit;
  return (
    <section id="Prom" className="Prom min-h-screen w-full flex items-center justify-center py-20">
      <div className="container mx-auto my-10 flex flex-col lg:flex-row overflow-hidden rounded-[40px] shadow-2xl relative">

        {/* Contenedor IZQUIERDO - FORMULARIO */}
         <div className="CONIZ_PROM w-full lg:w-1/2 p-10 flex flex-col justify-center z-10">
          <h2 className="text-3xl mb-6 text-center font-bold text-[#38100e]">
            {isEditMode ? 'MODIFICAR PROMOCIÓN' : 'AGREGAR PROMOCIÓN'}
          </h2>
          {/* --- MODIFICADO: Pasar las props al formulario --- */}
          <PromotionForm 
            promotionToEdit={promotionToEdit}
            onUpdateComplete={onUpdateComplete}
            onCancelEdit={onCancelEdit}
          />
        </div>

        {/* Contenedor DERECHO - FOTO/INFO */}
        <div className="CONDER_PROM w-full lg:w-1/2 p-10 flex flex-col items-center justify-center text-white text-center relative">
          <div className="z-10">
            <h3 className="promosi mb-4">PROMOCIONES</h3>
            <p className="promos max-w-md">
              {isEditMode 
                ? 'Modifique los detalles de la promoción seleccionada.' 
                : 'Usted puede agregar nuevas promociones al catálogo y asignarles productos.'
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

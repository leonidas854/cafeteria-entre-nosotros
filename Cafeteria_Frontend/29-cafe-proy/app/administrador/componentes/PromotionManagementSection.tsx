// app/admin/components/PromotionManagementSection.tsx
'use client';

import PromotionForm from './PromotionForm';

export default function PromotionManagementSection() {
  return (
    <section id="Prom" className="Prom min-h-screen w-full flex items-center justify-center py-20">
      <div className="container mx-auto my-10 flex flex-col lg:flex-row overflow-hidden rounded-[40px] shadow-2xl relative">

        {/* Contenedor IZQUIERDO - FORMULARIO */}
        <div className="CONIZ_PROM w-full lg:w-1/2 p-10 flex flex-col justify-center z-10">
          <h2 className="text-3xl mb-6 text-center font-bold text-[#38100e]">AGREGAR PROMOCIONES</h2>
          <PromotionForm />
        </div>

        {/* Contenedor DERECHO - FOTO/INFO */}
        <div className="CONDER_PROM w-full lg:w-1/2 p-10 flex flex-col items-center justify-center text-white text-center relative">
          <div className="z-10">
            <h3 className="promosi mb-4">PROMOCIONES</h3>
            <p className="promos max-w-md">
              Usted puede agregar nuevas promociones al catálogo de promociones y asignarles múltiples productos fácilmente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

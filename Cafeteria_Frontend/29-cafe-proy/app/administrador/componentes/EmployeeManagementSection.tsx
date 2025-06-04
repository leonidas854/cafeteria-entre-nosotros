// app/admin/components/EmployeeManagementSection.tsx
'use client';

import EmployeeForm from './EmployeeForm';

export default function EmployeeManagementSection() {
  return (
    <section id="Emple" className="Emple h-screen w-full flex items-center justify-center"> {/* bg-gray-200 original */}
      <div className="container mx-auto flex">
        {/* Contenedor izquierdo */}
        <div className="CONIZ_EMPLE w-1/2 p-8 flex items-center justify-center">
          <div className="text-center p-8"> {/* Overlay aplicado por CSS a CONIZ_EMPLE */}
            <h1 className="text-4xl font-bold mb-4" style={{ zIndex: 3 }}>EMPLEADO</h1>
            <p className="text-xl max-w-2xl" style={{ zIndex: 3 }}>
              Aqui usted puede agregar un nuevo empleado o administrador de la cafetería.
            </p>
          </div>
        </div>

        {/* Contenedor DERECHO - Formulario */}
        <div className="CONDER_EMPLE w-1/2 p-8 flex flex-col justify-center">
          <h2>AGREGAR EMPLEADO</h2>
          <EmployeeForm />
        </div>
      </div>
    </section>
  );
}
// app/admin/components/EmployeeManagementSection.tsx
'use client';

import EmployeeForm from './EmployeeForm';
import type { EmpleadoAPIResponse } from './ReportsSection';


interface EmployeeManagementSectionProps {
  employeeToEdit: EmpleadoAPIResponse | null;
  onUpdateComplete: () => void;
  onCancelEdit: () => void;
}


export default function EmployeeManagementSection({
  employeeToEdit,
  onUpdateComplete,
  onCancelEdit,
}: EmployeeManagementSectionProps) {

  const isEditMode = !!employeeToEdit;

  return (
    <section id="Emple" className="Emple h-screen w-full flex items-center justify-center">
      <div className="container mx-auto flex">
    
        <div className="CONIZ_EMPLE w-1/2 p-8 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-4" style={{ zIndex: 3 }}>EMPLEADO</h1>
          
            <p className="text-xl max-w-2xl" style={{ zIndex: 3 }}>
              {isEditMode
                ? 'Modifique los datos del empleado seleccionado.'
                : 'Aqui usted puede agregar un nuevo empleado o administrador.'
              }
            </p>
          </div>
        </div>

    
        <div className="CONDER_EMPLE w-1/2 p-8 flex flex-col justify-center">
         
          <h2>
            {isEditMode ? 'MODIFICAR EMPLEADO' : 'AGREGAR EMPLEADO'}
          </h2>
     
          <EmployeeForm
            employeeToEdit={employeeToEdit}
            onUpdateComplete={onUpdateComplete}
            onCancelEdit={onCancelEdit}
          />
        </div>
      </div>
    </section>
  );
}
// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

import WelcomeSection from './componentes/WelcomeSection';
import ProductManagementSection from './componentes/ProductManagementSection';
import EmployeeManagementSection from './componentes/EmployeeManagementSection';
import PromotionManagementSection from './componentes/PromotionManagementSection';
import ReportsSection, { ReportItem, EmpleadoAPIResponse } from './componentes/ReportsSection';
import AnimatedMenu from '../components/MenuAnimado';

import './styles/admin-global.css';
import './styles/product-section.css';
import './styles/employee-section.css';
import './styles/promotion-section.css';
import './styles/reports-section.css';

import type { Producto } from '@/app/api/productos';

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState('');
  const [itemToEdit, setItemToEdit] = useState<Producto | EmpleadoAPIResponse | null>(null);
  const [refreshReportsKey, setRefreshReportsKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = '#907761';
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setCurrentUser('');
    router.push('/login');
  };

  const handleEditRequest = (item: ReportItem) => {
    if ('empleado_rol' in item.originalData) {
      setItemToEdit(item.originalData as EmpleadoAPIResponse);
      document.getElementById('Emple')?.scrollIntoView({ behavior: 'smooth' });
    } else if ('categoria' in item.originalData) {
      setItemToEdit(item.originalData as Producto);
      document.getElementById('prod')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setItemToEdit(null);
    document.getElementById('Repor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateComplete = () => {
    toast.success('¡Actualización completada!');
    setItemToEdit(null); 
    setRefreshReportsKey((prevKey) => prevKey + 1); 
    document.getElementById('Repor')?.scrollIntoView({ behavior: 'smooth' });
  };


  const productToEdit = itemToEdit && 'categoria' in itemToEdit ? itemToEdit : null;
  const employeeToEdit = itemToEdit && 'empleado_rol' in itemToEdit ? itemToEdit : null;

  return (
    <div className="admin-dashboard">
      <Toaster position="top-right" />
      <WelcomeSection userName={currentUser} onLogout={handleLogout} />

   

   
      <ProductManagementSection
        productToEdit={productToEdit}
        onUpdateComplete={handleUpdateComplete}
        onCancelEdit={handleCancelEdit}
      />

     
      <EmployeeManagementSection
        employeeToEdit={employeeToEdit}
        onUpdateComplete={handleUpdateComplete}
        onCancelEdit={handleCancelEdit}
      />

     

      <PromotionManagementSection />

    
      <ReportsSection
        onEditRequest={handleEditRequest}
        refreshKey={refreshReportsKey}
      />
      
      <AnimatedMenu />
    </div>
  );
}
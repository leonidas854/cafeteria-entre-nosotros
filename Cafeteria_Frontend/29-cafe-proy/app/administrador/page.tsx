// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import WelcomeSection from './componentes/WelcomeSection';
import ProductManagementSection from './componentes/ProductManagementSection';
import EmployeeManagementSection from './componentes/EmployeeManagementSection';
import PromotionManagementSection from './componentes/PromotionManagementSection';
import ReportsSection from './componentes/ReportsSection';
import AnimatedMenu from '../components/MenuAnimado'; 

import toast,{Toaster} from 'react-hot-toast';

import './styles/admin-global.css'; 
import './styles/product-section.css';
import './styles/employee-section.css';
import './styles/promotion-section.css';
import './styles/reports-section.css';


export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState('');
  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = '#907761';

    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
     setCurrentUser(storedUser);
    } else {
    }
  }, [router]); 

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setCurrentUser(''); 
    router.push('/login');
  };
  return (
    <div className="admin-dashboard">

      <Toaster position="top-right" />
      <WelcomeSection userName={currentUser} onLogout={handleLogout} />

      

    
  <ProductManagementSection />


     
      <EmployeeManagementSection />
      <PromotionManagementSection />
      <ReportsSection />
      <AnimatedMenu />
    </div>
  );
}
'use client';
import { logout } from '@/app/api/CerrarSesC';
import { useRouter } from 'next/navigation';

interface WelcomeSectionProps {
  userName: string;
  onLogout: () => void;
}

export default function WelcomeSection({ userName, onLogout }: WelcomeSectionProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();         
      onLogout();              
      router.push('/login');   
    } catch (error) {
      console.error('Fallo al cerrar sesión:', error);
    }
  };

  return (
    <section id="inicio" className="inicio h-screen w-full flex flex-col items-center justify-center relative">
      <h1 className="text-6xl md:text-8xl text-black font-urwclassico z-10">
        Bienvenido {userName || 'Usuario'}
      </h1>
      <button
        onClick={handleLogout}
        className="mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition z-10"
      >
        Cerrar sesión
      </button>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast'; // Mantenemos el toast por si queremos mostrar errores simulados

// ----------- Interfaces --------------
interface Reseña {
  id_resena: number;
  Id_Cliente: number;
  Id_Producto: number;
  Comentario: string;
  Puntuacion: number; // Valor entre 1 y 5
  Fecha_Reseña: string;
}

// --------------------------------------

// 💾 DATASET SIMULADO (JSON) 💾
const reseñasSimuladas: Reseña[] = [
  {
    id_resena: 1,
    Id_Cliente: 101,
    Id_Producto: 501,
    Comentario: "El mejor café puro irlandés que he probado. ¡Excelente aroma!",
    Puntuacion: 5,
    Fecha_Reseña: "2024-10-25",
  },
  {
    id_resena: 2,
    Id_Cliente: 102,
    Id_Producto: 502,
    Comentario: "El postre de chocolate estaba un poco seco, esperaba más frescura.",
    Puntuacion: 2,
    Fecha_Reseña: "2024-10-26",
  },
  {
    id_resena: 3,
    Id_Cliente: 103,
    Id_Producto: 501,
    Comentario: "Rápida atención y el café es consistente. ¡Recomendado!",
    Puntuacion: 5,
    Fecha_Reseña: "2024-10-27",
  },
  {
    id_resena: 4,
    Id_Cliente: 104,
    Id_Producto: 503,
    Comentario: "El ambiente es agradable, pero el té de la casa no me convenció.",
    Puntuacion: 3,
    Fecha_Reseña: "2024-10-28",
  },
  {
    id_resena: 5,
    Id_Cliente: 105,
    Id_Producto: 504,
    Comentario: "¡Increíble! El pastel de zanahoria es mi nueva obsesión.",
    Puntuacion: 5,
    Fecha_Reseña: "2024-10-29",
  },
  {
    id_resena: 6,
    Id_Cliente: 106,
    Id_Producto: 505,
    Comentario: "Buena opción para un desayuno rápido. La puntuación es justa.",
    Puntuacion: 4,
    Fecha_Reseña: "2024-10-30",
  },
  {
    id_resena: 7,
    Id_Cliente: 107,
    Id_Producto: 502,
    Comentario: "Demasiado dulce. El nivel de azúcar en el postre es exagerado.",
    Puntuacion: 1,
    Fecha_Reseña: "2024-10-31",
  },
  {
    id_resena: 8,
    Id_Cliente: 108,
    Id_Producto: 501,
    Comentario: "Volveré solo por este café. La calidad es premium.",
    Puntuacion: 5,
    Fecha_Reseña: "2024-11-01",
  },
  {
    id_resena: 9,
    Id_Cliente: 109,
    Id_Producto: 504,
    Comentario: "Un excelente lugar para una tarde tranquila. El postre fue el acompañamiento perfecto.",
    Puntuacion: 4,
    Fecha_Reseña: "2024-11-02",
  },
  {
    id_resena: 10,
    Id_Cliente: 110,
    Id_Producto: 503,
    Comentario: "El servicio fue lento, aunque el producto final era bueno.",
    Puntuacion: 3,
    Fecha_Reseña: "2024-11-03",
  },
];

// --------------------------------------

export default function ReseñasDashboard() {
  const [reseñas, setReseñas] = useState<Reseña[]>([]);
  const [loading, setLoading] = useState(true);

  // MODIFICACIÓN: Esta función ahora carga los datos simulados
  const fetchReseñasSimuladas = async () => {
    // Simular un pequeño retardo de red (opcional)
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    try {
      // Aquí asignamos directamente el JSON simulado al estado
      setReseñas(reseñasSimuladas);
    } catch (error) {
      // En un caso real, esto sería donde manejarías errores del fetch
      console.error("Error simulado al cargar datos:", error);
      toast.error("Error simulado al cargar reseñas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Llamamos a la nueva función de carga simulada
    fetchReseñasSimuladas();
  }, []);

  // Calcular promedio general
  const promedio =
    reseñas.length > 0
      ? (
          reseñas.reduce((acc, r) => acc + r.Puntuacion, 0) /
          reseñas.length
        ).toFixed(1)
      : "0";

  // Calcular Max/Min de forma segura para evitar errores en arrays vacíos
  const puntuacionMaxima = reseñas.length > 0 ? Math.max(...reseñas.map(r => r.Puntuacion)) : 0;
  const puntuacionMinima = reseñas.length > 0 ? Math.min(...reseñas.map(r => r.Puntuacion)) : 0;


  return (
    <div className="p-8">

      <h1 className="text-4xl text-center font-bold text-white-700 mb-8 bg-black">
         Dashboard de Reseñas
      </h1>

      {/* ---------- Tarjetas de estadísticas ------------ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Reseñas" value={reseñas.length} />
        <StatCard title="Promedio General" value={`${promedio} ⭐`} />
        <StatCard title="Puntuación Máx." value={puntuacionMaxima} />
        <StatCard title="Puntuación Mín." value={puntuacionMinima} />
      </div>

      {/* ---------- TABLA DE RESEÑAS ------------ */}
      <div className="bg-black rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-white">Listado de Reseñas</h2>

        {loading ? (
          <p className="text-white">Cargando reseñas...</p>
        ) : (
          <table className="w-full text-left border-collapse text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3">ID</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Comentario</th>
                <th className="p-3">Punt.</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {reseñas.map((r) => (
                <tr key={r.id_resena} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="p-3">{r.id_resena}</td>
                  <td className="p-3">{r.Id_Cliente}</td>
                  <td className="p-3">{r.Id_Producto}</td>
                  <td className="p-3 max-w-xs truncate">{r.Comentario}</td>
                  <td className="p-3 text-yellow-500 font-bold">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i}>{i < r.Puntuacion ? "⭐" : "☆"}</span>
                    ))}
                  </td>
                  <td className="p-3">{r.Fecha_Reseña}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}

// ------ Componente tarjeta de estadísticas (No requiere cambios) -------
function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="p-5 bg-amber-100 border rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-3xl font-bold text-amber-700 mt-2">{value}</p>
    </div>
  );
}
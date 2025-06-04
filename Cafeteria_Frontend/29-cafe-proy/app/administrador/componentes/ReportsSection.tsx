'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';


import {
  Producto, 
  getTodosProductos,
  cambiarEstadoProducto,
  eliminarProducto as eliminarProductoAPI, 
} from '@/app/api/productos'; 

// Importaciones de API de Usuarios
import {
  getClientes,
  getEmpleados,
  eliminarCliente,
  eliminarEmpleado,
} from '@/app/api/Usuarios'; 

import {
  confirmarContrasenia
} from '@/app/api/Admin'; 

interface ClienteAPIResponse {
  usuario: string;
  nombre: string;
  apell_paterno?: string;
  apell_materno?: string;
  telefono: string;
  nit: string;
  ubicacion: string;
  latitud: string | number;
  longitud: string | number;
}

interface EmpleadoAPIResponse {
  usuario: string;
  nombre: string;
  apell_paterno?: string;
  apell_materno?: string;
  telefono: string;
  empleado_rol: string;
  fecha_contrato: string | Date;
}

interface ReportItem {
  id: string; // producto.id.toString() o usuario
  name: string;
  details: string[];
  imageUrl?: string;
  estado?: 'activo' | 'inactivo';
  usuario?: string; // Para clientes/empleados, coincide con id
  originalData: Producto | ClienteAPIResponse | EmpleadoAPIResponse;
}

const filterOptions: Record<string, string[]> = {
  clientes: ['NIT', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Teléfono', 'Usuario'],
  ventas: [],
  empleados: ['Nombre', 'Apellido Paterno', 'Apellido Materno', 'Teléfono', 'Usuario', 'Rol', 'Fecha de contrato'],
  productos: ['Tipo', 'Categoría', 'Subcategoría', 'Nombre', 'Precio', 'Estado', 'Descripción', 'Sabores'],
};

export default function ReportsSection() {
  const [searchType, setSearchType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('');

  const [clientReports, setClientReports] = useState<ReportItem[]>([]);
  const [salesReports, setSalesReports] = useState<ReportItem[]>([]);

  const [employeeReports, setEmployeeReports] = useState<ReportItem[]>([]);
  const [productReports, setProductReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  

  const fetchAndSetData = useCallback(async (type: string) => {
    if (type === 'ventas') { // No hacer nada para ventas por ahora
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (type === 'productos') {
        const productosData = await getTodosProductos();
        setProductReports(
          productosData.map((p: Producto) => ({
            id: p.id.toString(),
            name: p.nombre,
            details: [
              `Tipo: ${p.tipo}`,
              `Categoría: ${p.categoria} > ${p.sub_categoria}`,
              `Descripción: ${p.descripcion.substring(0, 70)}${p.descripcion.length > 70 ? '...' : ''}`,
              `Precio: ${p.precio} Bs.`,
              `Estado: ${p.estado ? 'activo' : 'inactivo'}`,
              `Sabores: ${p.sabores}`,
              ...(p.proporcion ? [`Proporción: ${p.proporcion}`] : []),
              ...(p.tamanio ? [`Tamaño: ${p.tamanio}`] : []),
            ],
           estado: (p.estado ? 'activo' : 'inactivo') as 'activo' | 'inactivo',
            imageUrl: p.image_url as string | undefined,
            originalData: p,
          }))
        );
      } else if (type === 'clientes') {
        const clientesData: ClienteAPIResponse[] = await getClientes();
        setClientReports(
          clientesData.map((c) => ({
            id: c.usuario,
            usuario: c.usuario,
            name: `${c.nombre} ${c.apell_paterno || ''} ${c.apell_materno || ''}`.trim(),
            details: [
              `Usuario: ${c.usuario}`,
              `Teléfono: ${c.telefono}`,
              `NIT: ${c.nit}`,
              `Ubicación: ${c.ubicacion}`,
            ],
            originalData: c,
          }))
        );
      } else if (type === 'empleados') {
        const empleadosData: EmpleadoAPIResponse[] = await getEmpleados();
        setEmployeeReports(
          empleadosData.map((e) => ({
            id: e.usuario,
            usuario: e.usuario,
            name: `${e.nombre} ${e.apell_paterno || ''} ${e.apell_materno || ''}`.trim(),
            details: [
              `Usuario: ${e.usuario}`,
              `Teléfono: ${e.telefono}`,
              `Rol: ${e.empleado_rol}`,
              `Fecha de contrato: ${new Date(e.fecha_contrato).toLocaleDateString()}`,
            ],
            originalData: e,
          }))
        );
      }
    } catch (error: any) {
      console.error(`Error al cargar datos para ${type}:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Error al cargar datos de ${type}.`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchType) {
      fetchAndSetData(searchType);
    } else {
      setProductReports([]);
      setClientReports([]);
      setEmployeeReports([]);
      setSalesReports([]);
    }
  }, [searchType, fetchAndSetData]);

  const handleToggleEstado = async (productId: string, currentEstado: 'activo' | 'inactivo') => {
    const productIndex = productReports.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const originalProduct = productReports[productIndex];
    const nuevoEstadoBool = currentEstado === 'activo' ? false : true;
    const nuevoEstadoString = nuevoEstadoBool ? 'activo' : 'inactivo';
    

    // Optimistic update
    const updatedProduct: ReportItem = {
  ...originalProduct,
  estado: nuevoEstadoString as 'activo' | 'inactivo', // <- SOLUCIÓN
  details: originalProduct.details.map(detail =>
    detail.startsWith('Estado:') ? `Estado: ${nuevoEstadoString}` : detail
  ),
  originalData: {
    ...(originalProduct.originalData as Producto),
    estado: nuevoEstadoBool,
  }
};

    
    const newProductReports = [...productReports];
    newProductReports[productIndex] = updatedProduct;
    setProductReports(newProductReports);

    try {
      await cambiarEstadoProducto(parseInt(productId), nuevoEstadoBool);
      toast.success(`Producto "${originalProduct.name}" ${nuevoEstadoString === 'activo' ? 'activado' : 'inactivado'}.`);
    } catch (error: any) {
      console.error('Error al cambiar estado del producto:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al cambiar estado.';
      toast.error(errorMessage);
      // Revert optimistic update
      const revertedProductReports = [...productReports];
      revertedProductReports[productIndex] = originalProduct; // Revert to original
      setProductReports(revertedProductReports);
    }
  };

  const handleEliminar = async (item: ReportItem) => {
  try {
    const confirmDelete = window.confirm(`¿Seguro que deseas eliminar a "${item.name}"?`);
    if (!confirmDelete) return;


    setIsLoading(true); // Activar el loader

    // Ejecutar eliminación según el tipo
    if (searchType === 'clientes' && item.usuario) {
      await eliminarCliente(item.usuario);
      toast.success(`Cliente "${item.name}" eliminado exitosamente.`);
    } else if (searchType === 'empleados' && item.usuario) {
      await eliminarEmpleado(item.usuario);
      toast.success(`Empleado "${item.name}" eliminado exitosamente.`);
    } else if (searchType === 'productos') {
      await eliminarProductoAPI(item.name);
      toast.success(`Producto "${item.name}" eliminado exitosamente.`);
    }

    await fetchAndSetData(searchType); // Refrescar los datos
  } catch (error: any) {
    console.error('Error al eliminar:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar el item.';

    if (
      !(error.response?.status === 401 && (searchType === 'clientes' || searchType === 'empleados')) &&
      !(error.response?.status === 404)
    ) {
      toast.error(errorMessage);
    }
  } finally {
    setIsLoading(false);
  }
};


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
   
  };

  const filteredReports = useMemo(() => {
    let reportsToFilter: ReportItem[] = [];
    switch (searchType) {
      case 'clientes': reportsToFilter = clientReports; break;
      case 'ventas': reportsToFilter = salesReports; break;
      case 'empleados': reportsToFilter = employeeReports; break;
      case 'productos': reportsToFilter = productReports; break;
      default: return [];
    }

    if (!searchTerm.trim() && !filterField) { 
        return reportsToFilter;
    }
    if (!searchTerm.trim() && filterField) { 
        return reportsToFilter;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return reportsToFilter.filter(item => {
      const { originalData } = item;

      if (!filterField) { 
        if (item.name.toLowerCase().includes(lowerSearchTerm)) return true;
        if (item.details.some(detail => detail.toLowerCase().includes(lowerSearchTerm))) return true;
        
        if (originalData) { originalData
          if (searchType === 'productos') {
            const p = originalData as Producto;
            return p.descripcion.toLowerCase().includes(lowerSearchTerm) ||
                   p.sabores.toLowerCase().includes(lowerSearchTerm) ||
                   p.tipo.toLowerCase().includes(lowerSearchTerm) ||
                   p.categoria.toLowerCase().includes(lowerSearchTerm) ||
                   p.sub_categoria.toLowerCase().includes(lowerSearchTerm);
          }
          // Para clientes y empleados, item.name y item.details ya cubren bastante.
          // Se podrían añadir más campos si es necesario.
        }
        return false;
      }

      // Búsqueda por campo específico (filterField)
      if (!originalData) return false;
      let valueToTest: any;
      switch (searchType) {
        case 'productos':
          const p = originalData as Producto;
          if (filterField === 'tipo') valueToTest = p.tipo;
          else if (filterField === 'categoría') valueToTest = p.categoria;
          else if (filterField === 'subcategoría') valueToTest = p.sub_categoria;
          else if (filterField === 'nombre') valueToTest = p.nombre;
          else if (filterField === 'precio') valueToTest = p.precio;
          else if (filterField === 'estado') valueToTest = p.estado ? 'activo' : 'inactivo';
          else if (filterField === 'descripción') valueToTest = p.descripcion;
          else if (filterField === 'sabores') valueToTest = p.sabores;
          break;
        case 'clientes':
          const c = originalData as ClienteAPIResponse;
          if (filterField === 'nit') valueToTest = c.nit;
          else if (filterField === 'nombre') valueToTest = c.nombre;
          else if (filterField === 'apellido paterno') valueToTest = c.apell_paterno;
          else if (filterField === 'apellido materno') valueToTest = c.apell_materno;
          else if (filterField === 'teléfono') valueToTest = c.telefono;
          else if (filterField === 'usuario') valueToTest = c.usuario;
          break;
        case 'empleados':
          const e = originalData as EmpleadoAPIResponse;
          if (filterField === 'nombre') valueToTest = e.nombre;
          else if (filterField === 'apellido paterno') valueToTest = e.apell_paterno;
          else if (filterField === 'apellido materno') valueToTest = e.apell_materno;
          else if (filterField === 'teléfono') valueToTest = e.telefono;
          else if (filterField === 'usuario') valueToTest = e.usuario;
          else if (filterField === 'rol') valueToTest = e.empleado_rol;
          else if (filterField === 'fecha de contrato') valueToTest = new Date(e.fecha_contrato).toLocaleDateString();
          break;
      }
      return valueToTest?.toString().toLowerCase().includes(lowerSearchTerm);
    });
  }, [searchType, clientReports, employeeReports, productReports, salesReports, searchTerm, filterField]);

  const renderReportCards = (items: ReportItem[]) => {
    if (isLoading && items.length === 0) { // Muestra cargando solo si no hay items previos
        return <p className="text-center text-gray-500 py-10">Cargando reportes...</p>;
    }
    if (items.length === 0 && !isLoading) {
        return <p className="text-center text-gray-500 py-10">No hay reportes para mostrar con los filtros actuales.</p>;
    }
    return (
        <ul className="space-y-4">
        {items.map(item => (
            <li key={item.id} className="bg-white rounded-lg shadow flex flex-col sm:flex-row p-4 items-start sm:items-center justify-between">
            <div className="flex items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">
                {item.imageUrl && (
                <img src={item.imageUrl} alt={`Imagen de ${item.name}`} className="w-16 h-16 rounded-full object-cover mr-4 flex-shrink-0" />
                )}
                <div className="flex flex-col justify-center">
                <h4 className={`font-bold ${
                    searchType === 'clientes' ? 'text-[#0D47A1]' :
                    searchType === 'empleados' ? 'text-[#1B5E20]' :
                    searchType === 'productos' ? 'text-[#6A1B9A]' :
                    'text-gray-800'
                }`}>
                    {item.name}
                </h4>
                {item.details?.map((text, idx) => (
                    <p key={idx} className={`text-sm ${
                    searchType === 'clientes' ? 'text-[#1976D2]' :
                    searchType === 'empleados' ? 'text-[#388E3C]' :
                    searchType === 'productos' ? 'text-[#AB47BC]' :
                    'text-gray-600'
                    } break-words max-w-md`}> {/* break-words y max-w para descripciones */}
                    {text}
                    </p>
                ))}
                </div>
            </div>
            <div className="flex space-x-2 mt-2 sm:mt-0 self-center sm:self-auto flex-shrink-0">
                {searchType === 'productos' && item.estado && (
                <button
                    className={`text-sm px-3 py-1 rounded text-white whitespace-nowrap ${item.estado === 'activo' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    onClick={() => handleToggleEstado(item.id, item.estado!)} // item.estado está garantizado aquí
                    disabled={isLoading}
                >
                    {item.estado === 'activo' ? 'Inactivar' : 'Activar'}
                </button>
                )}
                <button 
                  className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded whitespace-nowrap"
                  onClick={() => toast('Funcionalidad "Modificar" no implementada.', { icon: '🚧' })}
                  disabled={isLoading}
                >
                  Modificar
                </button>
                <button
                  className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded whitespace-nowrap"
                  onClick={() => handleEliminar(item)}
                  disabled={isLoading}
                >
                  Eliminar
                </button>
            </div>
            </li>
        ))}
        </ul>
    );
  };

  return (
    <section className="h-full w-full flex flex-col items-center bg-gray-100 py-8 px-4 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Reportes</h2>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 bg-white rounded-lg px-4 py-3 shadow-md">
        {['clientes', 'empleados', 'productos', 'ventas'].map(type => (
          <label key={type} className="flex items-center space-x-2 text-gray-800 font-medium cursor-pointer">
            <input 
              type="radio" 
              name="searchType" 
              value={type} 
              checked={searchType === type}
              onChange={(e) => {
                setSearchType(e.target.value);
                setFilterField('');
                setSearchTerm('');
              }}
              className="form-radio text-blue-600 focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="capitalize">{type}</span>
          </label>
        ))}
      </div>

      {searchType && (
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6 w-full max-w-4xl bg-white p-4 rounded shadow">
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="border border-gray-300 bg-white text-gray-800 font-medium rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={searchType === 'ventas' || isLoading || filterOptions[searchType]?.length === 0}
          >
            <option value="">-- Buscar en todos los campos --</option>
            {filterOptions[searchType]?.map(opt => (
              <option key={opt} value={opt.toLowerCase().replace(/\s+/g, ' ').trim()}>{opt}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar..."
            className="border border-gray-300 bg-white text-gray-800 font-medium rounded px-4 py-2 flex-grow shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={searchType === 'ventas' || isLoading}
          />

          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={searchType === 'ventas' || isLoading}
          >
            Buscar
          </button>
        </form>
      )}

      {searchType && searchType !== 'ventas' && (
        <div className="w-full max-w-6xl">
          <div className={`rounded-xl shadow-lg p-6 ${
            searchType === 'clientes' ? 'bg-[#E8F0FE]' :
            searchType === 'empleados' ? 'bg-[#E8F5E9]' :
            searchType === 'productos' ? 'bg-[#F3E5F5]' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold text-center mb-4 uppercase ${
              searchType === 'clientes' ? 'text-[#1A73E8]' :
              searchType === 'empleados' ? 'text-[#43A047]' :
              searchType === 'productos' ? 'text-[#8E24AA]' : 'text-gray-700'
            }`}>
              Reportes de {searchType}
            </h3>
            <div className="max-h-[calc(100vh-400px)] min-h-[200px] overflow-y-auto custom-scrollbar pr-2"> {/* Altura dinámica y mínima */}
              {renderReportCards(filteredReports)}
            </div>
          </div>
        </div>
      )}
       {searchType === 'ventas' && (
        <div className="w-full max-w-6xl text-center p-10 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-[#FB8C00] mb-4 uppercase">Reportes de Ventas</h3>
            <p className="text-gray-600">La sección de reportes de ventas aún no está implementada.</p>
            <p className="text-4xl mt-4">🚧</p>
        </div>
      )}
    </section>
  );
}
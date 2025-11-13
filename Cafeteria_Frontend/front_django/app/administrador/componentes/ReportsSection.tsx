'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

import {
  Producto,
  getTodosProductos,
  cambiarEstadoProducto,
  eliminarProducto as eliminarProductoAPI,
} from '@/app/api/productos';

import {
  Promocion2,
  Todas_las_Promociones,
  eliminarPromocion,
} from '@/app/api/Promociones';

import {
  getClientes,
  getEmpleados,
  eliminarCliente,
  eliminarEmpleado,
} from '@/app/api/Usuarios';

import { fetchPedidosConInfoCompleta } from '@/app/api/Pedido';


export interface ClienteAPIResponse {
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

export interface EmpleadoAPIResponse {
  usuario: string;
  nombre: string;
  apell_paterno?: string;
  apell_materno?: string;
  telefono: string;
  empleado_rol: string;
  fecha_contrato: string | Date;
}

export interface ReportItem {
  id: string;
  name: string;
  details: string[];
  imageUrl?: string;
  estado?: 'activo' | 'inactivo';
  usuario?: string;
  originalData: Producto | ClienteAPIResponse | EmpleadoAPIResponse | Promocion2;
}

export interface VentaReportItem {
  id: string;
  fecha: string;
  cliente: string;
  empleado: string;
  total: number;
  tipoEntrega: string;
  tipoPago: string;
  estado: string;
  detalles: {
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    extras: { nombre: string; precio: number }[];
  }[];
  originalData: any;
}

function VentaCard({ item }: { item: VentaReportItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const estadoColor: Record<string, string> = {
    'Pendiente': 'bg-yellow-200 text-yellow-800',
    'En_preparacion': 'bg-blue-200 text-blue-800',
    'Listo_para_entrega': 'bg-indigo-200 text-indigo-800',
    'En_camino': 'bg-purple-200 text-purple-800',
    'Entregado': 'bg-green-200 text-green-800',
    'Cancelado': 'bg-red-200 text-red-800',
  };

  return (
    <li className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div className="font-bold text-lg text-gray-700">#{item.id}</div>
          <div className="text-sm text-gray-600">{item.fecha}</div>
          <div className="font-medium text-gray-800">{item.cliente}</div>
        </div>
        <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${estadoColor[item.estado] || 'bg-gray-200 text-gray-800'}`}>
                {item.estado.replace(/_/g, ' ')}
            </span>
            <div className="font-bold text-lg text-green-600">{item.total.toFixed(2)} Bs.</div>
            <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      {isExpanded && (
  <div className="p-4 border-t border-gray-200 bg-white">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Detalles del Pedido</h4>
        <p className="text-sm text-gray-800"><span className="font-medium">Atendido por:</span> {item.empleado}</p>
        <p className="text-sm text-gray-800"><span className="font-medium">Entrega:</span> {item.tipoEntrega}</p>
        <p className="text-sm text-gray-800"><span className="font-medium">Pago:</span> {item.tipoPago}</p>
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Productos</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-800">
          {item.detalles.map((d, index) => (
            <li key={index} className="text-sm">
              {d.cantidad}x {d.productoNombre} - {(d.cantidad * d.precioUnitario).toFixed(2)} Bs.
              {d.extras.length > 0 && (
                <ul className="list-['+'] list-inside pl-4 text-xs text-gray-600">
                  {d.extras.map((e, i) => <li key={i}>{e.nombre}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}

    </li>
  );
}


// --- Componente Principal ---
const filterOptions: Record<string, string[]> = {
  clientes: ['NIT', 'Nombre', 'Apellido Paterno', 'Apellido Materno', 'Teléfono', 'Usuario'],
  ventas: ['ID Pedido', 'Fecha (YYYY-MM-DD)', 'Nombre Cliente', 'Nombre Empleado', 'Tipo de Entrega', 'Tipo de Pago', 'Estado', 'Producto'],
  empleados: ['Nombre', 'Apellido Paterno', 'Apellido Materno', 'Teléfono', 'Usuario', 'Rol', 'Fecha de contrato'],
  productos: ['Tipo', 'Categoría', 'Subcategoría', 'Nombre', 'Precio', 'Estado', 'Descripción', 'Sabores'],
   promociones: ['Nombre', 'Descripción', 'Fecha de inicio', 'Fecha de fin', 'Entre Fechas', 'Activa'],
};

interface ReportsSectionProps {
  onEditRequest: (item: ReportItem) => void;
  refreshKey: number;
}

export default function ReportsSection({ onEditRequest, refreshKey }: ReportsSectionProps) {
  const [searchType, setSearchType] = useState('');
  const [filterField, setFilterField] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  

  const [isLoading, setIsLoading] = useState(false);

  const [productReports, setProductReports] = useState<ReportItem[]>([]);
  const [clientReports, setClientReports] = useState<ReportItem[]>([]);
  const [employeeReports, setEmployeeReports] = useState<ReportItem[]>([]);
   const [appliedFilterField, setAppliedFilterField] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [rawSalesData, setRawSalesData] = useState<any[]>([]);
  const [noSales, setNoSales] = useState(false);
  const [promotionReports, setPromotionReports] = useState<ReportItem[]>([]);

  const fetchAndSetData = useCallback(async (type: string) => {
    if (type === 'ventas') return;

    setIsLoading(true);
    try {
      if (type === 'productos') {
        const data = await getTodosProductos();
        setProductReports(data.map((p: Producto) => ({
            id: p.id.toString(), name: p.nombre, details: [`Tipo: ${p.tipo}`, `Categoría: ${p.categoria} > ${p.sub_categoria}`, `Descripción: ${p.descripcion.substring(0,70)}...`, `Precio: ${p.precio} Bs.`, `Estado: ${p.estado ? 'activo' : 'inactivo'}`], estado: p.estado ? 'activo' : 'inactivo', imageUrl: p.image_url as string | undefined, originalData: p,
        })));
      } else if (type === 'clientes') {
        const data: ClienteAPIResponse[] = await getClientes();
        setClientReports(data.map((c) => ({
            id: c.usuario, name: `${c.nombre} ${c.apell_paterno || ''} ${c.apell_materno || ''}`.trim(), details: [`Usuario: ${c.usuario}`, `Teléfono: ${c.telefono}`, `NIT: ${c.nit}`], usuario: c.usuario, originalData: c,
        })));
      } else if (type === 'empleados') {
        const data: EmpleadoAPIResponse[] = await getEmpleados();
        setEmployeeReports(data.map((e) => ({
            id: e.usuario, name: `${e.nombre} ${e.apell_paterno || ''} ${e.apell_materno || ''}`.trim(), details: [`Usuario: ${e.usuario}`, `Teléfono: ${e.telefono}`, `Rol: ${e.empleado_rol}`], usuario: e.usuario, originalData: e,
        })));
      }
      else if (type === 'promociones') {
        const data: Promocion2[] = await Todas_las_Promociones();
        setPromotionReports(data.map((promo) => {
          const hoy = new Date();
          const inicio = new Date(promo.fech_ini);
          const fin = new Date(promo.fecha_final);
          fin.setHours(23, 59, 59, 999); 
          const estado = hoy >= inicio && hoy <= fin ? 'activo' : 'inactivo';

          const fechaInicioFormateada = inicio.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const fechaFinFormateada = fin.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

          let productosText = 'Productos: No asignados';
          if (promo.productos && promo.productos.length > 0) {
            const productNames = promo.productos.map(p => p.nombre).slice(0, 3);
            productosText = `Productos: ${productNames.join(', ')}`;
            if (promo.productos.length > 3) {
              productosText += `, y ${promo.productos.length - 3} más...`;
            }
          }

          return {
            id: promo.id.toString(),
            name: promo.strategykey,
            details: [
              `Descripción: ${promo.descripcion.substring(0, 70)}...`,
              `Vigencia: ${fechaInicioFormateada} al ${fechaFinFormateada}`,
              `Estado: ${estado}`,
              productosText, 
            ],
            imageUrl: promo.full_image_url,
            estado: estado,
            originalData: promo
          };
        }));
      }
    } catch (error: any) {
      console.error(`Error al cargar datos para ${type}:`, error);
      toast.error(error.response?.data?.message || `Error al cargar datos de ${type}.`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchType) {
      if (searchType === 'ventas') {
        setIsLoading(true);
        setNoSales(false);
        fetchPedidosConInfoCompleta(setRawSalesData, setNoSales, setIsLoading);
      } else {
        fetchAndSetData(searchType);
      }
    } else {
      setProductReports([]);
      setClientReports([]);
      setEmployeeReports([]);
       setPromotionReports([]);
      setRawSalesData([]);
      setNoSales(false);
    }
  }, [searchType, fetchAndSetData, refreshKey]);



const salesReports = useMemo((): VentaReportItem[] => {
  if (!rawSalesData || rawSalesData.length === 0) {
    return [];
  }
  
  return rawSalesData.map((v: any) => ({
 
    id: v.pedido?.id_pedido?.toString() ,
    fecha: v.venta?.fecha ? new Date(v.venta.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A',
    cliente: v.cliente ? `${v.cliente.nombre} ${v.cliente.apellidoPaterno || ''}`.trim() : 'N/A',
    empleado: v.venta?.empleado ? `${v.venta.empleado.nombre} ${v.venta.empleado.apellidoPaterno || ''}`.trim() : 'Sistema',
    total: v.venta?.total_final ?? v.pedido.total_estimado,
    tipoEntrega: v.pedido.tipoEntrega || 'N/A',
    tipoPago: v.venta?.tipoPago || 'Pendiente',
    estado: v.pedido.estado || 'N/A',
    detalles: (v.detalles || []).map((d: any) => ({
      productoNombre: d.productoNombre || 'Producto no encontrado',
      cantidad: d.cantidad,
      precioUnitario: d.precio_unitario,
      extras: (d.extras || []).map((e: any) => ({ nombre: e.nombre, precio: e.precio }))
    })),
    originalData: v,
  }));
}, [rawSalesData]);

  const filteredReports = useMemo(() => {
    let baseReports: (ReportItem | VentaReportItem)[] = [];
    switch (searchType) {
      case 'clientes': baseReports = clientReports; break;
      case 'ventas': baseReports = salesReports; break;
      case 'empleados': baseReports = employeeReports; break;
      case 'productos': baseReports = productReports; break;
      case 'promociones': baseReports = promotionReports; break;
      default: return [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    return baseReports.filter(item => {
      // Caso 1: Filtro por rango de fechas
      if (filterField === 'entre fechas') {
        if (!startDate || !endDate) return true; // Mostrar todo si falta una fecha
        const startFilter = new Date(startDate);
        startFilter.setUTCHours(0, 0, 0, 0);
        const endFilter = new Date(endDate);
        endFilter.setUTCHours(23, 59, 59, 999);

        if (searchType === 'ventas') {
          const ventaDateStr = (item as VentaReportItem).originalData.venta?.fecha;
          if (!ventaDateStr) return false;
          const ventaDate = new Date(ventaDateStr);
          return ventaDate >= startFilter && ventaDate <= endFilter;
        }
        if (searchType === 'promociones') {
          const promo = (item as ReportItem).originalData as Promocion2;
          const promoStart = new Date(promo.fech_ini);
          const promoEnd = new Date(promo.fecha_final);
          return promoStart <= endFilter && promoEnd >= startFilter;
        }
        return false;
      }
      
    
      if (!lowerSearchTerm) return true;

      if (!filterField) {
        if (item.id.toLowerCase().includes(lowerSearchTerm)) return true;
        if ((item as ReportItem).details?.some(detail => detail.toLowerCase().includes(lowerSearchTerm))) return true;

        if (searchType === 'productos') {
          const p = (item as ReportItem).originalData as Producto;
          return p.descripcion.toLowerCase().includes(lowerSearchTerm) || (p.sabores && p.sabores.toLowerCase().includes(lowerSearchTerm)) || p.tipo.toLowerCase().includes(lowerSearchTerm) || p.categoria.toLowerCase().includes(lowerSearchTerm) || p.sub_categoria.toLowerCase().includes(lowerSearchTerm);
        }
        if (searchType === 'ventas') {
          const v = item as VentaReportItem;
          return v.detalles.some(d => d.productoNombre.toLowerCase().includes(lowerSearchTerm));
        }
        return false;
      }

      // Caso 3: Búsqueda por campo específico
      let valueToTest: any = '';
      const originalData = item.originalData as any;

      switch (searchType) {
        case 'productos':
          if (filterField === 'tipo') valueToTest = originalData.tipo;
          else if (filterField === 'categoría') valueToTest = originalData.categoria;
          else if (filterField === 'subcategoría') valueToTest = originalData.sub_categoria;
          else if (filterField === 'nombre') valueToTest = originalData.nombre;
          else if (filterField === 'precio') valueToTest = originalData.precio;
          else if (filterField === 'estado') valueToTest = originalData.estado ? 'activo' : 'inactivo';
          else if (filterField === 'descripción') valueToTest = originalData.descripcion;
          else if (filterField === 'sabores') valueToTest = originalData.sabores;
          break;
        case 'clientes':
          if (filterField === 'nit') valueToTest = originalData.nit;
          else if (filterField === 'nombre') valueToTest = originalData.nombre;
          else if (filterField === 'apellido paterno') valueToTest = originalData.apell_paterno;
          else if (filterField === 'apellido materno') valueToTest = originalData.apell_materno;
          else if (filterField === 'teléfono') valueToTest = originalData.telefono;
          else if (filterField === 'usuario') valueToTest = originalData.usuario;
          break;
        case 'empleados':
          if (filterField === 'rol') valueToTest = originalData.empleado_rol;
          else if (filterField === 'nombre') valueToTest = originalData.nombre;
          else if (filterField === 'apellido paterno') valueToTest = originalData.apell_paterno;
          else if (filterField === 'apellido materno') valueToTest = originalData.apell_materno;
          else if (filterField === 'teléfono') valueToTest = originalData.telefono;
          else if (filterField === 'usuario') valueToTest = originalData.usuario;
          else if (filterField === 'fecha de contrato') return originalData.fecha_contrato ? originalData.fecha_contrato.toString().substring(0, 10) === lowerSearchTerm : false;
          break;
        case 'promociones':
          if (filterField === 'nombre') valueToTest = originalData.strategykey;
          else if (filterField === 'descripción') valueToTest = originalData.descripcion;
          else if (filterField === 'fecha de inicio') return originalData.fech_ini.substring(0, 10) === lowerSearchTerm;
          else if (filterField === 'fecha de fin') return originalData.fecha_final.substring(0, 10) === lowerSearchTerm;
          else if (filterField === 'activa') valueToTest = item.estado;
          break;
        case 'ventas':
          const venta = item as VentaReportItem;
          if (filterField === 'id pedido') valueToTest = venta.id;
          else if (filterField === 'fecha (yyyy-mm-dd)') return venta.originalData.venta?.fecha?.substring(0, 10) === lowerSearchTerm;
          else if (filterField === 'nombre cliente') valueToTest = venta.cliente;
          else if (filterField === 'nombre empleado') valueToTest = venta.empleado;
          else if (filterField === 'tipo de entrega') valueToTest = venta.tipoEntrega;
          else if (filterField === 'tipo de pago') valueToTest = venta.tipoPago;
          else if (filterField === 'estado') valueToTest = venta.estado;
          else if (filterField === 'producto') return venta.detalles.some(d => d.productoNombre.toLowerCase().includes(lowerSearchTerm));
          break;
      }
      return valueToTest?.toString().toLowerCase().includes(lowerSearchTerm);
    });
  }, [searchType, clientReports, employeeReports, productReports, promotionReports, salesReports, searchTerm, filterField, startDate, endDate]);
  
  const handleToggleEstado = async (productId: string, currentEstado: 'activo' | 'inactivo') => {
    const productIndex = productReports.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const originalProduct = productReports[productIndex];
    const nuevoEstadoBool = currentEstado === 'activo' ? false : true;
    setProductReports(prev => prev.map(p => p.id === productId ? {...p, estado: nuevoEstadoBool ? 'activo' : 'inactivo' } : p));
    try {
      await cambiarEstadoProducto(parseInt(productId), nuevoEstadoBool);
      toast.success(`Producto "${originalProduct.name}" actualizado.`);
    } catch (error: any) {
      toast.error('Error al cambiar estado.');
      setProductReports(prev => prev.map(p => p.id === productId ? originalProduct : p));
    }
  };

  const handleEliminar = async (item: ReportItem) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a "${item.name}"?`)) return;
    setIsLoading(true);
    try {
        if (searchType === 'clientes' && item.usuario) await eliminarCliente(item.usuario);
        else if (searchType === 'empleados' && item.usuario) await eliminarEmpleado(item.usuario);
        else if (searchType === 'productos') await eliminarProductoAPI(item.name);
        else if (searchType === 'promociones') await eliminarPromocion(item.name);
        toast.success(`"${item.name}" eliminado exitosamente.`);
        fetchAndSetData(searchType);
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error al eliminar el item.');
    } finally {
        setIsLoading(false);
    }
  };
  
   const handleSearchSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    setAppliedFilterField(filterField);
    setAppliedSearchTerm(searchTerm);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const renderReportCards = () => {
    const items = filteredReports;
    if (isLoading && items.length === 0) {
        return <p className="text-center text-gray-500 py-10">Cargando reportes...</p>;
    }
    if ((!isLoading && items.length === 0) || (searchType === 'ventas' && noSales)) {
        return <p className="text-center text-gray-500 py-10">No hay reportes para mostrar con los filtros actuales.</p>;
    }
    
    if (searchType === 'ventas') {
      return (
        <ul className="space-y-3">
          {(items as VentaReportItem[]).map(item => (
            <VentaCard key={item.id} item={item} />
          ))}
        </ul>
      );
    }
    
    return (
        <ul className="space-y-4">
        {(items as ReportItem[]).map(item => (
            <li key={item.id} className="bg-white rounded-lg shadow flex flex-col sm:flex-row p-4 items-start sm:items-center justify-between">
                <div className="flex items-start sm:items-center w-full sm:w-auto mb-4 sm:mb-0">
                    {item.imageUrl && (
                    <img src={item.imageUrl} alt={`Imagen de ${item.name}`} className="w-16 h-16 rounded-full object-cover mr-4 flex-shrink-0" />
                    )}
                    <div className="flex flex-col justify-center">
                        <h4 className="font-bold">{item.name}</h4>
                        {item.details?.map((text, idx) => (<p key={idx} className="text-sm">{text}</p>))}
                    </div>
                </div>
                <div className="flex space-x-2 mt-2 sm:mt-0 self-center sm:self-auto flex-shrink-0">
                    {searchType === 'productos' && item.estado && (
                    <button className={`text-sm px-3 py-1 rounded text-white whitespace-nowrap ${item.estado === 'activo' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`} onClick={() => handleToggleEstado(item.id, item.estado!)} disabled={isLoading}>
                        {item.estado === 'activo' ? 'Inactivar' : 'Activar'}
                    </button>
                    )}
                    {(searchType === 'productos' || searchType === 'empleados'|| searchType === 'promociones') && (
                    <button className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded whitespace-nowrap" onClick={() => onEditRequest(item)} disabled={isLoading}>
                        Modificar
                    </button>
                    )}
                    {searchType !== 'ventas' && (
                        <button className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded whitespace-nowrap" onClick={() => handleEliminar(item as ReportItem)} disabled={isLoading}>
                            Eliminar
                        </button>
                    )}
                </div>
            </li>
        ))}
        </ul>
    );
  };

  const showSingleDatePicker = 
    (searchType === 'ventas' && filterField === 'fecha (yyyy-mm-dd)') ||
    (searchType === 'empleados' && filterField === 'fecha de contrato') ||
    (searchType === 'promociones' && (filterField === 'fecha de inicio' || filterField === 'fecha de fin'));

  const showDateRangePicker = filterField === 'entre fechas';

   const clearAllFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setAppliedSearchTerm('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setAppliedFilterField('');
  };
  return (
    <section id="Repor" className="h-full w-full flex flex-col items-center bg-gray-100 py-8 px-4 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Reportes</h2>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 bg-white rounded-lg px-4 py-3 shadow-md">
        {Object.keys(filterOptions).map(type => (
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
            onChange={(e) => {
              setFilterField(e.target.value);
              clearAllFilters();
            }}
            className="border border-gray-300 bg-white text-gray-800 font-medium rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto disabled:opacity-50"
            disabled={isLoading || filterOptions[searchType]?.length === 0}
          >
            <option value="">-- Buscar en todos los campos --</option>
            {filterOptions[searchType]?.map(opt => (
              <option key={opt} value={opt.toLowerCase().replace(/\s+/g, ' ').trim()}>{opt}</option>
            ))}
          </select>


          
          {showDateRangePicker ? (
            <div className="flex flex-col md:flex-row md:items-center gap-2 flex-grow w-full">
              <input
                type="date"
                className="border border-gray-300 bg-white text-gray-800 font-medium rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:flex-1 disabled:opacity-50"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
              <span className="text-gray-500 font-medium hidden md:block">a</span>
              <input
                type="date"
                className="border border-gray-300 bg-white text-gray-800 font-medium rounded px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:flex-1 disabled:opacity-50"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          ) : showSingleDatePicker? (
            <input
              type="date"
              className="border border-gray-300 bg-white text-gray-800 font-medium rounded px-4 py-2 flex-grow shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:flex-1 disabled:opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          ) : (
            <input
              type="text"
              placeholder="Buscar..."
              className="border border-gray-300 bg-white text-gray-800 font-medium rounded px-4 py-2 flex-grow shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:flex-1 disabled:opacity-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              //disabled={isLoading}
              
              disabled={isLoading || (filterField === 'entre fechas')}
            />
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition w-full md:w-auto disabled:opacity-50"
            disabled={isLoading}
          >
            Buscar
          </button>
        </form>
      )}

      {searchType && (
        <div className="w-full max-w-6xl">
          <div className={`rounded-xl shadow-lg p-6 ${
  searchType === 'clientes' ? 'bg-[#E8F0FE]' :
  searchType === 'empleados' ? 'bg-[#E8F5E9]' :
  searchType === 'productos' ? 'bg-[#F3E5F5]' :
  searchType === 'ventas' ? 'bg-orange-50' :
  searchType === 'promociones' ? 'bg-teal-50' :
  'bg-white'
} text-gray-800`}>

            <h3 className={`text-xl font-bold text-center mb-4 uppercase ${
              searchType === 'clientes' ? 'text-[#1A73E8]' :
              searchType === 'empleados' ? 'text-[#43A047]' :
              searchType === 'productos' ? 'text-[#8E24AA]' :
              searchType === 'ventas' ? 'text-orange-600' :
              searchType === 'promociones' ? 'text-teal-700' :
              'text-gray-700'
            }`}>
              Reportes de {searchType}
            </h3>
            <div className="max-h-[calc(100vh-400px)] min-h-[200px] overflow-y-auto custom-scrollbar pr-2">
              {renderReportCards()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { getRoles } from '@/app/api/Admin';
import { registrarEmpleado } from '@/app/api/LoginEmpleado';
import toast from 'react-hot-toast';

interface EmployeeFormData {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
  fechaContratacion: string;
  password: string;
  telefono: string;
  rol: string;
}

const initialEmployeeFormState: EmployeeFormData = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  usuario: '',
  fechaContratacion: '',
  password: '',
  telefono: '',
  rol: '',
};

export default function EmployeeForm() {
  const [formData, setFormData] = useState<EmployeeFormData>(initialEmployeeFormState);
  const [roles, setRoles] = useState<string[]>([]);
  const [mostrarNuevoRol, setMostrarNuevoRol] = useState(false);
  const [nuevoRol, setNuevoRol] = useState('');

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const rolesDesdeApi = await getRoles();
        setRoles(rolesDesdeApi);
      } catch (error) {
        toast.error("❌ No se pudieron cargar los roles");
      }
    };
    cargarRoles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const agregarNuevoRol = () => {
    const nuevo = nuevoRol.trim();
    if (!nuevo) {
      toast.error("⚠️ El nombre del nuevo rol no puede estar vacío");
      return;
    }
    if (roles.includes(nuevo)) {
      toast.error("⚠️ El rol ya existe");
      return;
    }

    // Agregar el rol a la lista y seleccionarlo
    setRoles(prev => [...prev, nuevo]);
    setFormData(prev => ({ ...prev, rol: nuevo }));
    toast.success("✅ Rol agregado");
    setMostrarNuevoRol(false);
    setNuevoRol('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rolFinal = formData.rol.trim();
    if (!rolFinal) {
      toast.error("Debe seleccionar o ingresar un rol válido.");
      return;
    }

    const empleado = {
      nombre: formData.nombre,
      apell_paterno: formData.apellidoPaterno,
      apell_materno: formData.apellidoMaterno,
      telefono: parseInt(formData.telefono),
      usuario: formData.usuario,
      password: formData.password,
      Empleado_rol: rolFinal,
    };

    try {
      const response = await registrarEmpleado(empleado);
      if (response.isSuccess) {
       // toast.success('✅ Empleado registrado correctamente');
        setFormData(initialEmployeeFormState);
      } else {
        toast.error(response.mensaje || '❌ No se pudo registrar el empleado');
      }
    } catch (error) {
      toast.error('❌ Error al registrar empleado');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Nombre y Apellidos */}
      <div>
        <label className="block mb-2">Nombre</label>
        <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="form-input w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Apellido Paterno</label>
          <input type="text" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleInputChange} required className="form-input w-full" />
        </div>
        <div>
          <label className="block mb-2">Apellido Materno</label>
          <input type="text" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleInputChange} className="form-input w-full" />
        </div>
      </div>

      {/* Rol */}
      <div>
        <label className="block mb-2">Rol</label>
        
         <select
          name="rol"
          value={formData.rol}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '__nuevo__') {
              setMostrarNuevoRol(true);
              setFormData(prev => ({ ...prev, rol: '' }));
            } else {
              setFormData(prev => ({ ...prev, rol: value }));
              setMostrarNuevoRol(false);
              setNuevoRol('');
            }
          }}
          required
          className="form-input w-full"
        >
       
       
          <option value="">Seleccione un rol</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
       {  /* <option value="__nuevo__">+ Agregar nuevo rol</option>
            */}
          
        </select>

        {mostrarNuevoRol && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Nuevo rol"
              value={nuevoRol}
              onChange={(e) => setNuevoRol(e.target.value)}
              className="form-input flex-1"
              required
            />
            <button type="button" onClick={agregarNuevoRol} className="btn bg-green-600 text-white px-4 rounded">
              Guardar rol
            </button>
          </div>
        )}
    
      </div>

      {/* Usuario y Password */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Usuario</label>
          <input type="text" name="usuario" value={formData.usuario} onChange={handleInputChange} required className="form-input w-full" />
        </div>
        <div>
          <label className="block mb-2">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="form-input w-full" />
        </div>
      </div>

      {/* Fecha y Teléfono */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Fecha de Contratación</label>
          <input type="date" name="fechaContratacion" value={formData.fechaContratacion} onChange={handleInputChange} required className="form-input w-full" />
        </div>
        <div>
          <label className="block mb-2">Teléfono</label>
          <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} className="form-input w-full" />
        </div>
      </div>

      {/* Botón Final */}
      <button type="submit" className="emple-button w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700">
        AGREGAR EMPLEADO
      </button>
    </form>
  );
}

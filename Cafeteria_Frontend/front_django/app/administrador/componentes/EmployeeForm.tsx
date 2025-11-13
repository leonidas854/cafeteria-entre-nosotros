'use client';

import { useState, useEffect } from 'react';
import { getRoles } from '@/app/api/Admin';
import { registrarEmpleado } from '@/app/api/LoginEmpleado';
import toast from 'react-hot-toast';

import { actualizarEmpleado } from '@/app/api/Usuarios';
import type { EmpleadoAPIResponse } from './ReportsSection';

interface EmployeeFormData {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
  password: string;
  telefono: string;
  rol: string;
}

interface EmployeeFormProps {
  employeeToEdit?: EmpleadoAPIResponse | null;
  onUpdateComplete?: () => void;
  onCancelEdit?: () => void;
}
const initialEmployeeFormState: EmployeeFormData = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  usuario: '',
  password: '',
  telefono: '',
  rol: '',
};

export default function EmployeeForm({ employeeToEdit, onUpdateComplete, onCancelEdit }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>(initialEmployeeFormState);
  const [roles, setRoles] = useState<string[]>([]);
  const [mostrarNuevoRol, setMostrarNuevoRol] = useState(false);
    const isEditMode = !!employeeToEdit;

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

  useEffect(() => {
    if (isEditMode && employeeToEdit) {
      setFormData({
        nombre: employeeToEdit.nombre,
        apellidoPaterno: employeeToEdit.apell_paterno || '',
        apellidoMaterno: employeeToEdit.apell_materno || '',
        usuario: employeeToEdit.usuario,
        password: '', 
        telefono: employeeToEdit.telefono.toString(),
        rol: employeeToEdit.empleado_rol,
      });
    } else {
      setFormData(initialEmployeeFormState);
    }
  }, [employeeToEdit, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/;

    if (name === 'nombre' || name === 'apellidoPaterno' || name === 'apellidoMaterno') {
      if (soloLetrasRegex.test(value) || value === '') {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInputTelefono = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
   let soloNumeros = value.replace(/\D/g, '');


    if (soloNumeros.length > 8) {
    soloNumeros = soloNumeros.slice(0, 8);
  }

    
    if (soloNumeros.length > 0 && !/^[6789]/.test(soloNumeros)) return;

    setFormData(prev => ({
      ...prev,
      [name]: soloNumeros
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rolFinal = formData.rol.trim();
    if (!rolFinal) {
      toast.error("Debe seleccionar un rol válido.");
      return;
    }

    const telefonoNumero = parseInt(formData.telefono);
    if (isNaN(telefonoNumero)) {
      toast.error("Número de teléfono inválido");
      return;
    }

    const empleado = {
      nombre: formData.nombre,
      apell_paterno: formData.apellidoPaterno,
      apell_materno: formData.apellidoMaterno,
      telefono: telefonoNumero,
      usuario: formData.usuario,
      password: formData.password,
      Empleado_rol: rolFinal,
    };


    if (isEditMode && !empleado.password) {
      delete (empleado as any).password;
    }

    try {
      if (isEditMode && employeeToEdit) {
  
        const empleadoParaActualizar = {
          nombre: formData.nombre,
          apell_paterno: formData.apellidoPaterno,
          apell_materno: formData.apellidoMaterno,
          telefono: telefonoNumero,
          password: formData.password, 
          Empleado_rol: rolFinal,
        };

      
        if (!empleadoParaActualizar.password) {
            delete (empleadoParaActualizar as any).password;
        }

        console.log('🟡 Enviando para actualizar:', empleadoParaActualizar);
        
       
        await actualizarEmpleado(employeeToEdit.usuario, empleadoParaActualizar);
        onUpdateComplete?.(); 

      } else {
    
        const empleadoParaCrear = {
          nombre: formData.nombre,
          apell_paterno: formData.apellidoPaterno,
          apell_materno: formData.apellidoMaterno,
          telefono: telefonoNumero,
          usuario: formData.usuario,
          password: formData.password,
          Empleado_rol: rolFinal,
        };

        const response = await registrarEmpleado(empleadoParaCrear);
        if (response.isSuccess) {
          toast.success('✅ Empleado registrado correctamente');
          setFormData(initialEmployeeFormState);
        } else {
          toast.error(response.mensaje || '❌ No se pudo registrar el empleado');
        }
      }
    } catch (error) {
      console.error(error); 
      toast.error(isEditMode ? '❌ Error al actualizar empleado' : '❌ Error al registrar empleado');
    }
};

    return (
    <form className="space-y-4" onSubmit={handleSubmit}>
  
      <div>
        <label className="block mb-2 text-white">Nombre</label>
        <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="form-input w-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-white">Apellido Paterno</label>
          <input type="text" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleInputChange} required className="form-input w-full" />
        </div>
        <div>
          <label className="block mb-2 text-white">Apellido Materno</label>
          <input type="text" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleInputChange} className="form-input w-full" />
        </div>
      </div>

    
      <div>
        <label className="block mb-2 text-white">Rol</label>
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
            }
          }}
          required
          className="form-input w-full"
        >
          <option value="">Seleccione un rol</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
       
        </select>
      </div>

    
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-white">Usuario</label>
          <input
            type="text"
            name="usuario"
            value={formData.usuario}
            onChange={handleInputChange}
            required
            className="form-input w-full"
        
            disabled={isEditMode}
          />
        </div>
        <div>
          <label className="block mb-2 text-white">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
         
            required={!isEditMode}
            className="form-input w-full"
         
            placeholder={isEditMode ? "Dejar en blanco para no cambiar" : ""}
          />
        </div>
      </div>

 
      <div>
        <label className="block mb-2 text-white">Celular</label>
        <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputTelefono} placeholder="Ej: 71234567" className="form-input w-full" />
      </div>

 
      {isEditMode ? (

        <div className="flex space-x-4 mt-6">
          <button
            type="submit"
            className="emple-button w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 flex-1"
          >
            ACTUALIZAR EMPLEADO
          </button>
          <button
            type="button" 
            onClick={onCancelEdit}
            className="w-full py-2 px-4 rounded bg-gray-500 text-white hover:bg-gray-600 flex-1"
          >
            CANCELAR
          </button>
        </div>
      ) : (

        <button
          type="submit"
          className="emple-button w-full py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          AGREGAR EMPLEADO
        </button>
      )}
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { crearPromocion, editarPromocion, NuevaPromocion, Promocion2 } from '@/app/api/Promociones';
import { getProductos, Productos } from '@/app/api/Admin';
import toast from 'react-hot-toast';

interface PromotionFormData {
  descripcion: string;
  descuento: string;
  fechaInicial: string;
  fechaFinal: string;
  strategykey: string;
  imagen: File | null;
  productos: number[];
}

const initialPromotionFormState: PromotionFormData = {
  descripcion: '',
  descuento: '',
  fechaInicial: '',
  fechaFinal: '',
  strategykey: '',
  imagen: null,
  productos: []
};


interface PromotionFormProps {
  promotionToEdit?: Promocion2 | null;
  onUpdateComplete?: () => void;
  onCancelEdit?: () => void;
}

export default function PromotionForm({ promotionToEdit, onUpdateComplete, onCancelEdit }: PromotionFormProps) {
  const isEditMode = !!promotionToEdit;
  const [formData, setFormData] = useState<PromotionFormData>(initialPromotionFormState);
  const [productosDisponibles, setProductosDisponibles] = useState<Productos[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<Productos[]>([]);
  const [errorArchivo, setErrorArchivo] = useState('');
const [originalStrategyKey, setOriginalStrategyKey] = useState<string>('');
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const todosLosProductos = await getProductos();

        if (isEditMode && promotionToEdit) {
      
          setFormData({
            descripcion: promotionToEdit.descripcion,
            descuento: promotionToEdit.descuento.toString(),
      
            fechaInicial: promotionToEdit.fech_ini.substring(0, 10),
            fechaFinal: promotionToEdit.fecha_final.substring(0, 10),
            strategykey: promotionToEdit.strategykey,
            imagen: null,
            productos: promotionToEdit.productos.map(p => p.id)
          });
          
          setOriginalStrategyKey(promotionToEdit.strategykey);
          setProductosSeleccionados(promotionToEdit.productos.map(p => ({ id_producto: p.id, nombre: p.nombre })));
          
          const idsSeleccionados = new Set(promotionToEdit.productos.map(p => p.id));
          setProductosDisponibles(todosLosProductos.filter(p => !idsSeleccionados.has(p.id_producto)));
        
        } else {
          
          setProductosDisponibles(todosLosProductos);
          setProductosSeleccionados([]);
          setFormData(initialPromotionFormState);
        }
      } catch (error) {
        toast.error('Error al cargar los productos');
      }
    };
    cargarProductos();
  }, [promotionToEdit, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
    if (name === 'strategykey' || name === 'descripcion') {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/;
    if (regex.test(value) || value === '') {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  } else {
    
    setFormData({
      ...formData,
      [name]: value
    });
  }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  if (file) {
    if (!file.type.match('image.*')) {
      setErrorArchivo('Por favor, sube solo archivos de imagen (JPEG, PNG, GIF, etc.)');
      e.target.value = ''; 
      setFormData(prev => ({ ...prev, imagen: null }));
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrorArchivo('La imagen es demasiado grande (máximo 5MB)');
      e.target.value = '';
      setFormData(prev => ({ ...prev, imagen: null }));
      return;
    }
    
    setErrorArchivo('');
    setFormData(prev => ({ ...prev, imagen: file }));
  }
};

  const moverProductoADerecha = (producto: Productos) => {
    setProductosSeleccionados(prev => [...prev, producto]);
    setProductosDisponibles(prev => prev.filter(p => p.id_producto !== producto.id_producto));
    setFormData(prev => ({ ...prev, productos: [...prev.productos, producto.id_producto] }));
  };

  const moverProductoAIzquierda = (producto: Productos) => {
    setProductosDisponibles(prev => [...prev, producto]);
    setProductosSeleccionados(prev => prev.filter(p => p.id_producto !== producto.id_producto));
    setFormData(prev => ({ ...prev, productos: prev.productos.filter(id => id !== producto.id_producto) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion || !formData.descuento || !formData.fechaInicial || !formData.fechaFinal || formData.productos.length === 0) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const promoData: NuevaPromocion = {
      descripcion: formData.descripcion,
      descuento: parseFloat(formData.descuento),
      fech_ini: formData.fechaInicial,
      fecha_final: formData.fechaFinal,
      strategykey: formData.strategykey,
      imagen: formData.imagen || undefined,
      productos: formData.productos
    };

    try {
      if (isEditMode) {
        await editarPromocion(originalStrategyKey, promoData);
        onUpdateComplete?.(); 
      } else {
        await crearPromocion(promoData);
      
        setFormData(initialPromotionFormState);
        setProductosSeleccionados([]);
        const productos = await getProductos();
        setProductosDisponibles(productos);
      }
    } catch (error) {
      console.error(isEditMode ? "Error al editar promoción:" : "Error al crear promoción:", error);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        
        <input
        type="text"
        name="strategykey"
        placeholder="Nombre de la Promo"
        className="form-input"
        value={formData.strategykey}
        onChange={handleInputChange}
        required
        />
        
        <input
          type="number"
          name="descuento"
          placeholder="Descuento (%)"
          className="form-input"
          value={formData.descuento}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
  {/* Fecha Inicial */}
  <div className="flex flex-col">
    <label htmlFor="fechaInicial" className="form-label mb-1">
      Fecha Inicial
    </label>
    <input
      type="date"
      id="fechaInicial"
      name="fechaInicial"
      className="form-input"
      value={formData.fechaInicial}
      onChange={handleInputChange}
      required
    />
  </div>

  {/* Fecha Final */}
  <div className="flex flex-col">
    <label htmlFor="fechaFinal" className="form-label mb-1">
      Fecha Final
    </label>
    <input
      type="date"
      id="fechaFinal"
      name="fechaFinal"
      className="form-input"
      value={formData.fechaFinal}
      onChange={handleInputChange}
      required
    />
  </div>
</div>

      <textarea
        name="descripcion"
        className="form-input"
        placeholder="Descripción detallada"
        value={formData.descripcion}
        onChange={handleInputChange}
        required
      />

      <div className="mb-4">
          <label htmlFor="product-imagen" className="form-label block mb-2">
          Imagen del producto
          </label>
         <input
          type="file"
          id="promotion-form-imagen" 
          name="imagen"
          className={`form-input w-full p-2 border rounded ${
             errorArchivo ? 'border-red-500' : 'border-gray-300'
          }`}
          accept="image/*"
          onChange={handleFileChange}
          />
        {errorArchivo && (
        <p className="text-red-500 text-sm mt-1">{errorArchivo}</p>
        )}
        {formData.imagen && !errorArchivo && (
        <p className="text-green-600 text-sm mt-1">
          Archivo válido: {formData.imagen.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-2 text-[#333]">Productos disponibles</h4>
          <ul className="bg-[#fdf6e3] p-3 rounded-md shadow-md h-40 overflow-y-auto text-[#333]">

            {productosDisponibles.map(prod => (
              <li
                key={`disp-${prod.id_producto}`}
                className="cursor-pointer hover:bg-[#d6d6d6] px-2 py-1 rounded"
                onClick={() => moverProductoADerecha(prod)}
              >
                {prod.nombre}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-[#333]">Productos seleccionados</h4>
        <ul className="bg-[#d0ebff] p-3 rounded-md shadow-md h-40 overflow-y-auto text-[#000]">

            {productosSeleccionados.map(prod => (
              <li
                key={`sel-${prod.id_producto}`}
                className="cursor-pointer hover:bg-[#c7f7c7] px-2 py-1 rounded"
                onClick={() => moverProductoAIzquierda(prod)}
              >
                {prod.nombre}
              </li>
            ))}
          </ul>
        </div>
      </div>

       {isEditMode ? (
        <div className="flex space-x-4 mt-6">
          <button type="submit" className="prom-button flex-1">
            ACTUALIZAR PROMOCIÓN
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
        <button type="submit" className="prom-button w-full py-2 px-4 rounded">
          AGREGAR PROMOCIÓN
        </button>
      )}
    </form>
  );
}

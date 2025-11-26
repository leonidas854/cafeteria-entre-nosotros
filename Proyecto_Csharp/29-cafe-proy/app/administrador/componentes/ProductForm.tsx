// app/admin/components/ProductForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { crearProducto, actualizarProducto, Producto } from "@/app/api/productos";

import { getCategorias,
  getSaboresPorCategoria,
  getSubcategorias
} from "@/app/api/Admin";


type ProductType = 'comida' | 'bebida';
import toast,{Toaster} from 'react-hot-toast';

interface ProductFormData {
  categoria: string;
   sub_categoria: string;
  nombre: string;
  descripcion: string;
  precio: string;
  sabores: string;
  comidaOption: 'entero' | 'porcion';
  bebidaSizes: string[];
  imagen: File | null;
}
export interface SaboresPorCategoria {
  [categoria: string]: string[];
}

interface ProductFormProps {
  productToEdit?: Producto | null;
  onUpdateComplete?: () => void;
  onCancelEdit?: () => void;
}


const initialProductFormState: ProductFormData = {
  categoria: '',
  sub_categoria: '',
  nombre: '',
  descripcion: '',
  precio: '',
  sabores: '',
  comidaOption: 'entero',
  bebidaSizes: [],
  imagen: null,
};

export default function ProductForm({ productToEdit, onUpdateComplete, onCancelEdit }: ProductFormProps) {

  const isEditMode = !!productToEdit;
  const [productType, setProductType] = useState<ProductType>('comida');
  const [formData, setFormData] = useState<ProductFormData>(initialProductFormState);
  const [saboresPorCategoria, setSaboresPorCategoria] = useState<SaboresPorCategoria>({});
  const [nuevoSabor, setNuevoSabor] = useState('');
  const [categoriaParaNuevoSabor, setCategoriaParaNuevoSabor] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [subcategorias, setSubcategorias] = useState<string[]>([]);
  const [mostrarNuevaSubcategoria, setMostrarNuevaSubcategoria] = useState(false);
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState('');
  const [estadoActivo, setEstadoActivo] = useState(true);
  const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/;
  const [errorArchivo, setErrorArchivo] = useState('');


  useEffect(() => {
    if (isEditMode && productToEdit) {
      // Lógica para poblar el formulario desde productToEdit
      let baseName = productToEdit.nombre;
      if (productToEdit.tipo === 'comida') baseName = baseName.replace(/\s\((P|E)\)$/, '').trim();
      else if (productToEdit.tipo === 'bebida') baseName = baseName.replace(/\s\((M|G)\)$/, '').trim();
      
      setProductType(productToEdit.tipo as ProductType);
      setEstadoActivo(productToEdit.estado);
      setFormData({
        categoria: productToEdit.categoria,
        sub_categoria: productToEdit.sub_categoria,
        nombre: baseName,
        descripcion: productToEdit.descripcion,
        precio: productToEdit.precio.toString(),
        sabores: productToEdit.sabores,
        comidaOption: (productToEdit.proporcion as 'entero' | 'porcion') || 'entero',
        bebidaSizes: productToEdit.tamanio?.split(',') || [],
        imagen: null, 
      });
    } else {
      
      setFormData(initialProductFormState);
      setProductType('comida');
      setEstadoActivo(true);
      setErrorArchivo('');
    }
  }, [productToEdit, isEditMode]);
useEffect(() => {
  const cargarTodo = async () => {
    const categoriasServidor = await getCategorias();

// Si ya agregaste una categoría localmente y no está en la respuesta del servidor, mantenla
setCategorias(prev => {
  const nuevasLocales = prev.filter(cat => !categoriasServidor.includes(cat));
  return [...categoriasServidor, ...nuevasLocales];
});


    // Si es nueva categoría (NO está en la lista actual), no cargar subcategorías ni sabores
    if (mostrarNuevaCategoria || !categoriasServidor.includes(formData.categoria)) {
      setSubcategorias(['S/D']);
      setFormData(prev => ({ ...prev, sub_categoria: 'S/D' }));
      return;
    }

    const sabores = await getSaboresPorCategoria();
    setSaboresPorCategoria(sabores);

    if (formData.categoria) {
      const subs = await getSubcategorias(formData.categoria);
      setSubcategorias(subs.length > 0 ? subs : ['S/D']);
    }
  };

  cargarTodo();
}, [formData.categoria, mostrarNuevaCategoria]);







  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'nombre') {
    // Validación solo para letras y espacios
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

  const handleSizeToggle = (size: string) => {
    setFormData(prev => {
      const newSizes = prev.bebidaSizes.includes(size)
        ? prev.bebidaSizes.filter(s => s !== size)
        : [...prev.bebidaSizes, size];
      return { ...prev, bebidaSizes: newSizes };
    });
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const saboresFinales = formData.sabores.trim() === '' ? 'S/D' : formData.sabores;

    try {
      let nombreFinal = formData.nombre;

if (productType === 'comida') {
  const sufijo = formData.comidaOption === 'porcion' ? '(P)' : '(E)';
  nombreFinal = `${formData.nombre} ${sufijo}`;
} else if (productType === 'bebida') {
  // Usar solo el primero si hay uno seleccionado
  if (formData.bebidaSizes.includes('media')) {
    nombreFinal = `${formData.nombre} (M)`;
  } else if (formData.bebidaSizes.includes('grande')) {
    nombreFinal = `${formData.nombre} (G)`;
  }
}

      const producto = {
        id: 0,
        tipo: productType,
        categoria: formData.categoria,
        sub_categoria: formData.sub_categoria, 

        nombre: nombreFinal,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        estado: estadoActivo,
        sabores: saboresFinales,
        proporcion: productType === 'comida' ? formData.comidaOption : undefined,
        tamanio: productType === 'bebida' ? formData.bebidaSizes.join(',') : undefined,
        image_url: formData.imagen || undefined
      };

      if (!formData.nombre || !formData.precio || isNaN(parseFloat(formData.precio))) {
        toast.error("Por favor, completa todos los campos requeridos.");
   
        return;
      }

      if (isEditMode && productToEdit) {

        await actualizarProducto(productToEdit.nombre, producto as Producto);
        onUpdateComplete?.(); 
      } else {
      
        await crearProducto(producto as Producto);
        toast.success('Producto agregado correctamente');
        setFormData(initialProductFormState);
        setProductType('comida');
      }


    } catch (error) {
      console.error("Error al agregar producto:", error);
      toast.error('Error al agregar el producto.');
      toast.error(isEditMode ? 'Error al actualizar el producto.' : 'Error al agregar el producto.');


    }

    
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* tipo de producto */}
      <div className="form-group">
        <label className="form-label block mb-2">Tipo de Producto</label>
        <div className="flex space-x-4">
          {['comida', 'bebida'].map(tipo => (
            <label key={tipo} className="inline-flex items-center">
              <input
                type="radio"
                name="productType"
                value={tipo}
                className="form-radio"
                checked={productType === tipo}
                onChange={() => setProductType(tipo as ProductType)}
              />
              <span className="ml-2 capitalize">{tipo}</span>
            </label>
          ))}
        </div>
      </div>

      {/* nombre y precio */}
      <div className="grid grid-cols-2 gap-4">
        <input type="text" name="nombre" placeholder="Nombre del producto" value={formData.nombre} onChange={handleInputChange} className="form-input" required />
        <input type="number" name="precio" placeholder="0.00" min="0" value={formData.precio} onChange={handleInputChange} className="form-input" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
      {/* Categoría */}
  
       <div>
    
       <label className="form-label block mb-2">Categoría</label>
          <select
            className="form-input bg-neutral-900 text-white"
            value={formData.categoria}
            onChange={(e) => {
            const value = e.target.value;
            if (value === '__nueva__') {
             setMostrarNuevaCategoria(true);
            } else {
            setFormData(prev => ({ ...prev, categoria: value, sabores: '' }));
            setMostrarNuevaCategoria(false);
            }
          }}
                required
              >
              <option value="">Seleccione una categoría</option>
                  {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
                ))}
              <option value="__nueva__">+ Agregar nueva categoría</option>
          </select>
      {mostrarNuevaCategoria && (
      <>
        <input
          type="text"
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          className="form-input mt-2"
          pattern="[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+"
        />
       <button
        type="button"
        className="mt-2 btn"
        onClick={() => {
        if (!nuevaCategoria.trim()  || !soloLetrasRegex.test(nuevaCategoria)  ) return;
        const nueva = nuevaCategoria.trim();

        // Establecerla como la categoría seleccionada inmediatamente
        setFormData(prev => ({
        ...prev,
        categoria: nueva,
         sub_categoria: 'S/D'
         }));

          // Asegurar que se agregue la nueva categoría en el combo, si no existe
        setCategorias(prev => {
          if (!prev.includes(nueva)) {
          return [...prev, nueva];
          }
          return prev;
          });

  // Opcional: Inicializar sabores vacíos si decides usar esta categoría
         setSaboresPorCategoria(prev => ({
          ...prev,
          [nueva]: []
          }));

  // Ocultar input y limpiar campo
          setMostrarNuevaCategoria(false);
          setNuevaCategoria('');
}}
disabled={!nuevaCategoria.trim() || !soloLetrasRegex.test(nuevaCategoria)}
>
    Guardar nueva categoría
</button>
      </>
    )}
  </div>

  {/* Subcategoría */}
  <div>
    <label className="form-label block mb-2">Subcategoría</label>
    <select
  className="form-input bg-neutral-900 text-white"
  value={formData.sub_categoria || ''}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '__nueva__') {
      setMostrarNuevaSubcategoria(true);
      setFormData(prev => ({ ...prev, sub_categoria: '' }));
    } else {
      setFormData(prev => ({ ...prev, sub_categoria: value }));
      setMostrarNuevaSubcategoria(false);
    }
  }}
>
  <option value="">Seleccione una subcategoría</option>
  {subcategorias.map(sub => (
    <option key={sub} value={sub}>{sub}</option>
  ))}
  <option value="__nueva__">+ Agregar nueva subcategoría</option>
</select>


    {mostrarNuevaSubcategoria && (
      <>
        <input
          type="text"
          placeholder="Nueva subcategoría"
          value={nuevaSubcategoria}
          onChange={(e) => setNuevaSubcategoria(e.target.value)}
          className="form-input mt-2"
          pattern="[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+"
        />
        <button
          type="button"
          className="btn mt-2"
          onClick={() => {
            if (!nuevaSubcategoria.trim() || !soloLetrasRegex.test(nuevaSubcategoria) ) return;
            setSubcategorias(prev => [...prev, nuevaSubcategoria.trim()]);
            setFormData(prev => ({ ...prev, sub_categoria: nuevaSubcategoria.trim() }));
            setNuevaSubcategoria('');
            setMostrarNuevaSubcategoria(false);
          }}
           disabled={!nuevaSubcategoria.trim() || !soloLetrasRegex.test(nuevaSubcategoria)}
        >
          Guardar
        </button>
      </>
    )}
  </div>
</div>




      {/* descripción */}
      <textarea name="descripcion" placeholder="Descripción del producto" value={formData.descripcion} onChange={handleInputChange} className="form-input w-full" rows={2} required />

      {/* sabores por categoría */}
      <div className="form-group">
        <label className="form-label block mb-2">Sabores por Categoría</label>
       {formData.categoria && saboresPorCategoria[formData.categoria] && (
  <div className="mb-4 border rounded p-4">
    <strong className="block text-lg mb-2">🍽 Sabores para {formData.categoria}</strong>
    <div className="grid grid-cols-2 gap-2">
      {saboresPorCategoria[formData.categoria].map((sabor) => (
        <label key={sabor} className="inline-flex items-center">
          <input
            type="checkbox"
            checked={formData.sabores.split(',').includes(sabor)}
            onChange={() => {
              const seleccionados = formData.sabores.split(',');
              const existe = seleccionados.includes(sabor);
              const actualizados = existe
                ? seleccionados.filter(s => s !== sabor)
                : [...seleccionados, sabor];
              setFormData(prev => ({
                ...prev,
                sabores: actualizados.filter(Boolean).join(',')
              }));
            }}
          />
          <span className="ml-2">{sabor}</span>
        </label>
      ))}
    </div>

    {/* Agregar nuevo sabor en esta categoría */}
    <div className="mt-3 flex">
      <input
        type="text"
        className="form-input w-full"
        placeholder={`Nuevo sabor para ${formData.categoria}`}
        value={nuevoSabor}
        onChange={(e) => setNuevoSabor(e.target.value)}
      />
      <button
        type="button"
        className={`ml-2 btn ${ formData.sabores === 'S/D' ? 'opacity-50 cursor-not-allowed' : '' }`}
        onClick={() => {
          if (formData.sabores === 'S/D' || !nuevoSabor.trim() || !soloLetrasRegex.test(nuevoSabor)) return;
          setSaboresPorCategoria(prev => ({
            ...prev,
            [formData.categoria]: Array.from(new Set([...(prev[formData.categoria] || []), nuevoSabor.trim()]))
          }));
          setFormData(prev => ({
            ...prev,
            sabores: [...new Set([...prev.sabores.split(','), nuevoSabor.trim()])].join(',')
          }));
          setNuevoSabor('');
        }}
         disabled={formData.sabores === 'S/D' || !nuevoSabor.trim() || !soloLetrasRegex.test(nuevoSabor)}
      >
        Agregar
      </button>
    </div>
  </div>
)}


        {/* Checkbox S/D */}
        <label className="inline-flex items-center">
          <input
            type="checkbox"            
            checked={formData.sabores === 'S/D'}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setFormData(prev => ({
                ...prev,
                sabores: e.target.checked ? 'S/D' : ''
              }));
              if (isChecked) setNuevoSabor('');
            }}    
          />
          <span className="ml-2">Sin sabor (S/D)</span>
        </label>
      </div>

      <div className="mb-4">
  <label htmlFor="product-imagen" className="form-label block mb-2">
    Imagen del producto
  </label>
  <input
    type="file"
    id="product-imagen"
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

      {/* Comida / Bebida opciones */}
      {productType === 'comida' && (
        <div className="form-group border p-4 rounded">
          <label className="form-label block mb-2">Opciones para Comida</label>
          {['entero', 'porcion'].map(op => (
            <label key={op} className="inline-flex items-center">
              <input
                type="radio"
                name="comidaOption"
                value={op}
                className="form-radio"
                checked={formData.comidaOption === op}
                onChange={() => setFormData(prev => ({ ...prev, comidaOption: op as any }))}
              />
              <span className="ml-2 capitalize">{op}</span>
            </label>
          ))}
        </div>
      )}

      {productType === 'bebida' && (
        <div className="form-group border p-4 rounded">
          <label className="form-label block mb-2">Opciones para Bebida</label>
          {['media', 'grande'].map(tam => (
            <label key={tam} className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.bebidaSizes.includes(tam)}
                onChange={() => handleSizeToggle(tam)}
              />
              <span className="ml-2 capitalize">{tam}</span>
            </label>
          ))}
        </div>
      )}
      <div className="form-group border p-4 rounded">
  <label className="form-label block mb-2">Estado del Producto</label>
  <button
    type="button"
    className={`btn ${estadoActivo ? 'bg-green-600' : 'bg-red-600'}`}
    onClick={() => setEstadoActivo(prev => !prev)}
  >
    {estadoActivo ? 'Activo' : 'Inactivo'}
  </button>
</div>





     {isEditMode ? (
        <div className="flex space-x-4 mt-6">
          <button type="submit" className="prod-button flex-1">
            ACTUALIZAR PRODUCTO
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
        <button type="submit" className="prod-button">
          AGREGAR PRODUCTO
        </button>
      )}
    </form>
  );
}

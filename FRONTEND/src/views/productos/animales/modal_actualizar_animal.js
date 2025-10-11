import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { actualizarProducto, API_BASE_URL } from '../../../AXIOS.SERVICES/products-axios';

const ModalActualizarAnimal = ({ isOpen, onClose, onSave, editData }) => {
  const especies = [
    { label: 'PERRO', value: 'PERRO' },
    { label: 'GATO', value: 'GATO' },
    { label: 'AVE', value: 'AVE' },
    { label: 'PEZ', value: 'PEZ' },
    { label: 'REPTIL', value: 'REPTIL' },
    { label: 'ANFIBIO', value: 'ANFIBIO' }
  ];
  const sexos = [
    { label: 'HEMBRA', value: 'HEMBRA' },
    { label: 'MACHO', value: 'MACHO' }
  ];

  const [data, setData] = useState({
    nombre: '',
    especie: '',
    sexo: '',
    precio: 0,
    cantidad: 0,
    stock_minimo: 0,
    activo: 1,
    sku: '',
    file: null,
    preview: null
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Generar SKU
  const generarSKU = (nombre, id) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0,3).toUpperCase());
    return partes.join('-') + (id ? `-${id}` : '-XXX');
  };

  useEffect(() => {
    if (isOpen && editData) {
      setData({
        nombre: (editData.nombre || '').toUpperCase(),
        especie: (editData.especie || '').toUpperCase(),
        sexo: (editData.sexo || '').toUpperCase(),
        precio: editData.precio || 0,
        cantidad: editData.stock || 0,
        stock_minimo: editData.stock_minimo || 0,
        activo: editData.activo ? 1 : 0,
        sku: generarSKU(editData.nombre || '', editData.id_producto),
        file: null,
        preview: editData.imagenUrl ? `${API_BASE_URL}${editData.imagenUrl}` : null
      });
    }
  }, [isOpen, editData]);

  const handleChange = (field, value) => {
    const val = ['nombre','especie','sexo'].includes(field) ? value.toUpperCase() : value;
    setData(prev => {
      const newData = { ...prev, [field]: val };
      if(field === 'nombre') newData.sku = generarSKU(val, editData.id_producto);
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setData(prev => ({ ...prev, file, preview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!data.nombre || !data.precio || !data.cantidad) {
      alert('Por favor completa los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      // ✅ Crea un objeto simple con los datos
      const datosProducto = {
        id_producto: editData.id_producto,
        nombre_producto: data.nombre,
        precio_producto: data.precio,
        stock: data.cantidad,
        stock_minimo: data.stock_minimo,
        activo: data.activo,
        especie: data.especie,
        sexo: data.sexo,
        tipo_producto: 'ANIMALES'
      };

      // ✅ Pasa el objeto y el archivo por separado
      const res = await actualizarProducto(datosProducto, data.file);

      if (res.Consulta) {
        onSave(); // Recarga la lista desde el servidor
        onClose();
      } else {
        alert(`Error al actualizar: ${res.error}`);
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      alert('Ocurrió un error al actualizar el animal.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-4">
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        className="p-button-text p-button-rounded"
        onClick={onClose}
        disabled={loading}
      />
      <Button 
        label="Guardar" 
        icon="pi pi-check" 
        className="p-button-success p-button-rounded"
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog 
      header="Actualizar Animal"
      visible={isOpen}
      style={{ width: '50rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
    >
      <div className="flex flex-col gap-4 mt-2 text-sm">
        {/* Nombre */}
        <span className="p-float-label">
          <InputText 
            id="nombre" 
            value={data.nombre} 
            onChange={(e) => handleChange('nombre', e.target.value)} 
            className="w-full rounded-xl h-10 text-sm"
          />
          <label htmlFor="nombre" className="text-xs">Nombre</label>
        </span>

        {/* SKU readonly */}
        <span className="p-float-label">
          <InputText 
            id="sku"
            value={data.sku}
            readOnly
            className="w-full rounded-xl h-10 text-sm bg-gray-100"
          />
          <label htmlFor="sku" className="text-xs">SKU</label>
        </span>

        {/* Especie, Sexo, Activo */}
        <div className="grid grid-cols-3 gap-4">
          <span className="p-float-label">
            <Dropdown 
              id="especie"
              value={data.especie}
              options={especies}
              onChange={(e)=>handleChange('especie', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            <label htmlFor="especie" className="text-xs">Especie</label>
          </span>

          <span className="p-float-label">
            <Dropdown 
              id="sexo"
              value={data.sexo}
              options={sexos}
              onChange={(e)=>handleChange('sexo', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            <label htmlFor="sexo" className="text-xs">Sexo</label>
          </span>

          <span className="p-float-label">
            <Dropdown 
              id="activo"
              value={data.activo}
              options={[{label:'ACTIVO', value:1},{label:'INACTIVO', value:0}]}
              onChange={(e)=>handleChange('activo', e.value)}
              className="w-full rounded-xl text-sm"
            />
            <label htmlFor="activo" className="text-xs">Estado</label>
          </span>
        </div>

        {/* Precio, Stock, Stock mínimo */}
        <div className="grid grid-cols-3 gap-4">
          <span className="p-float-label">
            <InputNumber 
              id="precio" 
              value={data.precio} 
              onValueChange={(e) => handleChange('precio', e.value)} 
              mode="currency" 
              currency="HNL" 
              locale="es-HN" 
              className="w-full rounded-xl text-sm"
              inputClassName="h-10 text-sm"
            />
            <label htmlFor="precio" className="text-xs">Precio</label>
          </span>

          <span className="p-float-label">
            <InputNumber 
              id="cantidad" 
              value={data.cantidad} 
              onValueChange={(e) => handleChange('cantidad', e.value)} 
              className="w-full rounded-xl text-sm"
              inputClassName="h-10 text-sm"
            />
            <label htmlFor="cantidad" className="text-xs">Stock</label>
          </span>

          <span className="p-float-label">
            <InputNumber 
              id="stock_minimo" 
              value={data.stock_minimo} 
              onValueChange={(e) => handleChange('stock_minimo', e.value)} 
              className="w-full rounded-xl text-sm"
              inputClassName="h-10 text-sm"
            />
            <label htmlFor="stock_minimo" className="text-xs">Stock mínimo</label>
          </span>
        </div>

        {/* Selector de Imagen */}
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 mt-2 hover:border-blue-400 transition-all cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          {data.preview ? (
            <div className="relative">
              <img 
                src={data.preview} 
                alt="preview" 
                className="h-32 w-32 object-contain rounded-xl" 
              />
              <Button
                icon="pi pi-times"
                rounded
                text
                severity="danger"
                className="absolute -top-2 -right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setData(prev => ({ ...prev, file: null, preview: null }));
                }}
              />
            </div>
          ) : (
            <>
              <i className="pi pi-image text-3xl text-gray-400 mb-2"></i>
              <p className="text-gray-500 text-sm text-center">
                Haz clic para cambiar la imagen
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </Dialog>
  );
};

export default ModalActualizarAnimal;
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';

const ModalActualizarAlimento = ({ isOpen, onClose, onSave, editData }) => {
  const destinosBase = [
    { label: 'PERROS', value: 'PERROS' },
    { label: 'GATOS', value: 'GATOS' },
    { label: 'AVES', value: 'AVES' },
    { label: 'PECES', value: 'PECES' },
    { label: 'REPTILES', value: 'REPTILES' },
    { label: 'ANFIBIOS', value: 'ANFIBIOS' }
  ];

  const estados = [
    { label: 'ACTIVO', value: 1 },
    { label: 'INACTIVO', value: 0 }
  ];

  const [data, setData] = useState({
    nombre: '',
    precio: 0,
    cantidad: 0,
    peso: 0, // kg directamente
    destino: '',
    stock_minimo: 0,
    activo: 1,
    sku: '',
    imagenUrl: ''
  });

  const [loading, setLoading] = useState(false);

  // Función para generar SKU
  const generarSKU = (nombre, id) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0,3).toUpperCase());
    return partes.join('-') + (id ? `-${id}` : '-XXX');
  };

  // Precargar datos al abrir modal
  useEffect(() => {
    if (isOpen && editData) {
      setData({
        nombre: (editData.nombre || '').toUpperCase(),
        precio: Number(editData.precio) || 0,
        cantidad: Number(editData.stock) || 0,
        peso: Number(editData.peso) || 0, // kg directo
        destino: (editData.destino || '').toUpperCase(),
        stock_minimo: Number(editData.stock_minimo) || 0,
        activo: editData.activo ? 1 : 0,
        sku: generarSKU(editData.nombre || '', editData.id_producto),
        imagenUrl: editData.imagenUrl || ''
      });
    }
  }, [isOpen, editData]);

  const handleChange = (field, value) => {
    const val = ['nombre','destino'].includes(field) ? value.toUpperCase() : value;
    setData(prev => {
      const newData = { ...prev, [field]: val };
      if(field === 'nombre') newData.sku = generarSKU(val, editData.id_producto);
      return newData;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body = {
        id_producto: editData.id_producto,
        nombre_producto: data.nombre,
        precio_producto: data.precio,
        stock: data.cantidad,
        stock_minimo: data.stock_minimo,
        activo: data.activo,
        tipo_producto: 'ALIMENTOS',
        imagen_url: data.imagenUrl || null,
        peso_alimento: data.peso, // kg
        alimento_destinado: data.destino,
        sku: generarSKU(data.nombre, editData.id_producto)
      };

      const res = await actualizarProducto(body);
      if(res.Consulta){
        onSave({ ...editData, ...data, sku: body.sku });
        onClose();
      } else {
        alert(`Error al actualizar: ${res.error}`);
      }
    } catch(err) {
      console.error(err);
      alert('Ocurrió un error al actualizar el alimento.');
    } finally {
      setLoading(false);
    }
  };

  // Agregar valor actual al select si no está en la lista base
  const destinos = data.destino && !destinosBase.some(d=>d.value===data.destino)
    ? [...destinosBase, { label: data.destino, value: data.destino }]
    : destinosBase;

  const footer = (
    <div className="flex justify-end gap-3 mt-4">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text p-button-rounded" onClick={onClose} disabled={loading}/>
      <Button label="Guardar" icon="pi pi-check" className="p-button-success p-button-rounded" onClick={handleSubmit} loading={loading}/>
    </div>
  );

  return (
    <Dialog header="Actualizar Alimento" visible={isOpen} style={{ width: '50rem', borderRadius: '1.5rem' }} modal closable={false} onHide={onClose} footer={footer}>
      <div className="flex flex-col gap-4 mt-2 text-sm">
        {/* Nombre */}
        <span className="p-float-label">
          <InputText value={data.nombre} onChange={e=>handleChange('nombre', e.target.value)} className="w-full rounded-xl h-10 text-sm"/>
          <label className="text-xs">Nombre</label>
        </span>

        {/* SKU readonly */}
        <span className="p-float-label">
          <InputText value={data.sku} readOnly className="w-full rounded-xl h-10 text-sm bg-gray-100"/>
          <label className="text-xs">SKU</label>
        </span>

        <div className="grid grid-cols-3 gap-4">
          {/* Destino */}
          <span className="p-float-label">
            <Dropdown value={data.destino} options={destinos} onChange={e=>handleChange('destino', e.value)} className="w-full rounded-xl text-sm" placeholder="Seleccionar"/>
            <label className="text-xs">Destinado a</label>
          </span>

          {/* Peso */}
          <span className="p-float-label">
            <InputNumber value={data.peso} onValueChange={e=>handleChange('peso', e.value)} className="w-full rounded-xl text-sm" inputClassName="h-10 text-sm" suffix=" kg"/>
            <label className="text-xs">Peso (kg)</label>
          </span>

          {/* Estado */}
          <span className="p-float-label">
            <Dropdown value={data.activo} options={estados} onChange={e=>handleChange('activo', e.value)} className="w-full rounded-xl text-sm"/>
            <label className="text-xs">Estado</label>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Precio */}
          <span className="p-float-label">
            <InputNumber value={data.precio} onValueChange={e=>handleChange('precio', e.value)} mode="currency" currency="HNL" locale="es-HN" className="w-full rounded-xl text-sm" inputClassName="h-10 text-sm"/>
            <label className="text-xs">Precio</label>
          </span>

          {/* Stock */}
          <span className="p-float-label">
            <InputNumber value={data.cantidad} onValueChange={e=>handleChange('cantidad', e.value)} className="w-full rounded-xl text-sm" inputClassName="h-10 text-sm"/>
            <label className="text-xs">Stock</label>
          </span>

          {/* Stock mínimo */}
          <span className="p-float-label">
            <InputNumber value={data.stock_minimo} onValueChange={e=>handleChange('stock_minimo', e.value)} className="w-full rounded-xl text-sm" inputClassName="h-10 text-sm"/>
            <label className="text-xs">Stock mínimo</label>
          </span>
        </div>

        {/* Imagen visual */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 mt-2 hover:border-blue-400 transition-all cursor-pointer">
          <i className="pi pi-image text-3xl text-gray-400 mb-2"></i>
          <p className="text-gray-500 text-sm text-center">Haz clic para subir una imagen (solo visual)</p>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarAlimento;

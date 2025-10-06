import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { insertarProducto } from '../../../AXIOS.SERVICES/products-axios';

const ModalNuevoAnimal = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({
    nombre: '',
    especie: '',
    sexo: '',
    precio: '',
    cantidad: '',
    imagenUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const especies = [
    { label: 'PERRO', value: 'PERRO' },
    { label: 'GATO', value: 'GATO' },
    { label: 'AVE', value: 'AVE' },
    { label: 'REPTIL', value: 'REPTIL' },
    { label: 'ANFIBIO', value: 'ANFIBIO' }
  ];

  const sexos = [
    { label: 'HEMBRA', value: 'HEMBRA' },
    { label: 'MACHO', value: 'MACHO' }
  ];

  const handleChange = (field, value) => {
    const val = ['nombre','especie','sexo'].includes(field) ? value.toUpperCase() : value;
    setData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async () => {
    if (!data.nombre || !data.precio || !data.cantidad) {
      alert('Por favor completa los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        nombre_producto: data.nombre,
        precio_producto: data.precio,
        stock: data.cantidad,
        imagen_url: data.imagenUrl || null,
        tipo_producto: 'ANIMALES',
        especie: data.especie,
        sexo: data.sexo
      };

      const res = await insertarProducto(body);

      if (res.Consulta) {
        const nuevoAnimal = {
          id_producto: res.id_producto_pk,
          nombre: data.nombre,
          precio: parseFloat(data.precio),
          stock: data.cantidad,
          stock_minimo: 0,
          activo: true,
          tipo_producto: 'ANIMALES',
          imagenUrl: data.imagenUrl || '',
          especie: data.especie,
          sexo: data.sexo,
          sku: res.sku || 'SIN-SKU'
        };

        onSave(nuevoAnimal);
        onClose();
      } else {
        alert(`Error al guardar: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al guardar el animal.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
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
      header="Agregar Nuevo Animal"
      visible={isOpen}
      style={{ width: '38rem', borderRadius: '1.5rem' }}
      modal
      closable={false}  // 🔹 Oculta la X de la esquina superior
      onHide={onClose}
      footer={footer}
    >
      <div className="flex flex-col gap-3 mt-1 text-sm">
        {/* Nombre */}
        <span className="p-float-label">
          <InputText 
            id="nombre" 
            value={data.nombre} 
            onChange={(e) => handleChange('nombre', e.target.value)} 
            className="w-full rounded-xl h-9 text-sm"
          />
          <label htmlFor="nombre" className="text-xs">Nombre</label>
        </span>

        {/* Especie y Sexo */}
        <div className="grid grid-cols-2 gap-3">
          <span className="p-float-label">
            <Dropdown 
              id="especie" 
              value={data.especie} 
              options={especies} 
              onChange={(e) => handleChange('especie', e.value)} 
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
              onChange={(e) => handleChange('sexo', e.value)} 
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            <label htmlFor="sexo" className="text-xs">Sexo</label>
          </span>
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-3">
          <span className="p-float-label">
            <InputNumber 
              id="precio" 
              value={data.precio} 
              onValueChange={(e) => handleChange('precio', e.value)} 
              mode="currency" 
              currency="HNL" 
              locale="es-HN" 
              className="w-full rounded-xl text-sm"
              inputClassName="h-9 text-sm"
            />
            <label htmlFor="precio" className="text-xs">Precio</label>
          </span>

          <span className="p-float-label">
            <InputNumber 
              id="cantidad" 
              value={data.cantidad} 
              onValueChange={(e) => handleChange('cantidad', e.value)} 
              className="w-full rounded-xl text-sm"
              inputClassName="h-9 text-sm"
            />
            <label htmlFor="cantidad" className="text-xs">Stock</label>
          </span>
        </div>

        {/* Imagen visual (solo visual) */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 mt-2 hover:border-blue-400 transition-all cursor-pointer">
          <i className="pi pi-image text-3xl text-gray-400 mb-2"></i>
          <p className="text-gray-500 text-sm text-center">
            Haz clic para subir una imagen (solo visual)
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalNuevoAnimal;

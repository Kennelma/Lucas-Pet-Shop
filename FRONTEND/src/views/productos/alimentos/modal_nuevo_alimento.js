import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { insertarProducto } from '../../../AXIOS.SERVICES/products-axios';

const ModalNuevoAlimento = ({ isOpen, onClose, onSave }) => {
  const destinosBase = [
    { label: 'PERROS', value: 'PERROS' },
    { label: 'GATOS', value: 'GATOS' },
    { label: 'AVES', value: 'AVES' },
    { label: 'PECES', value: 'PECES' },
    { label: 'REPTILES', value: 'REPTILES' },
    { label: 'ANFIBIOS', value: 'ANFIBIOS' }
  ];

  const [data, setData] = useState({
    nombre: '',
    precio: 0,
    cantidad: 0,
    peso: 0,
    destino: '',
    imagenUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Manejar cambios de input
  const handleChange = (field, value) => {
    const val = ['nombre', 'destino'].includes(field) ? value.toUpperCase() : value;
    setData(prev => ({ ...prev, [field]: val }));
  };

  // Manejar imagen seleccionada
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setData(prev => ({ ...prev, imagenUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Guardar nuevo alimento
  const handleSubmit = async () => {
    if (!data.nombre || !data.precio) {
      alert('Por favor completa los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        nombre_producto: data.nombre,
        precio_producto: data.precio,
        stock: data.cantidad,
        tipo_producto: 'ALIMENTOS',
        peso_alimento: data.peso,
        alimento_destinado: data.destino,
        activo: 1
      };

      if (data.imagenUrl && data.imagenUrl.startsWith('data:image')) {
        body.imagen_base64 = data.imagenUrl;
      }

      const res = await insertarProducto(body);

      if (res.Consulta) {
        onSave();
        onClose();
        setData({
          nombre: '',
          precio: 0,
          cantidad: 0,
          peso: 0,
          destino: '',
          imagenUrl: ''
        });
      } else {
        alert(`Error al guardar: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al guardar el alimento.');
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
      header="Nuevo Alimento"
      visible={isOpen}
      style={{ width: '45rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
    >
      <div className="flex flex-col gap-4 mt-2 text-sm">
        {/* Nombre */}
        <span className="p-float-label">
          <InputText
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-10 text-sm"
          />
          <label className="text-xs">Nombre</label>
        </span>

        {/* Destino y Peso */}
        <div className="grid grid-cols-2 gap-4">
          <span className="p-float-label">
            <Dropdown
              value={data.destino}
              options={destinosBase}
              onChange={(e) => handleChange('destino', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            <label className="text-xs">Destinado a</label>
          </span>

          <span className="p-float-label">
            <InputNumber
              value={data.peso}
              onValueChange={(e) => handleChange('peso', e.value)}
              className="w-full rounded-xl text-sm"
              inputClassName="h-10 text-sm"
              suffix=" kg"
            />
            <label className="text-xs">Peso (kg)</label>
          </span>
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-4">
          <span className="p-float-label">
            <InputNumber
              value={data.precio}
              onValueChange={(e) => handleChange('precio', e.value)}
              mode="currency"
              currency="HNL"
              locale="es-HN"
              className="w-full rounded-xl text-sm"
              inputClassName="h-10 text-sm"
            />
            <label className="text-xs">Precio</label>
          </span>

          <span className="p-float-label">
            <InputNumber
              value={data.cantidad}
              onValueChange={(e) => handleChange('cantidad', e.value)}
              className="w-full rounded-xl text-sm"
              inputClassName="h-10 text-sm"
            />
            <label className="text-xs">Stock</label>
          </span>
        </div>

        {/* Imagen */}
        <div
          className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl mt-2 hover:border-blue-400 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {data.imagenUrl ? (
            <img
              src={data.imagenUrl}
              alt="alimento"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <i className="pi pi-image text-3xl mb-2"></i>
              <p className="text-sm text-center">Haz clic para subir una imagen</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ModalNuevoAlimento;

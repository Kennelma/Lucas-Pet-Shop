import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';

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

  const estados = [
    { label: 'ACTIVO', value: 1 },
    { label: 'INACTIVO', value: 0 }
  ];

  const [data, setData] = useState({
    nombre: '',
    especie: '',
    sexo: '',
    precio: 0,
    cantidad: 0,
    stock_minimo: 0,
    activo: 1,
    imagenUrl: '' 
  });

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && editData) {
      setData({
        nombre: (editData.nombre || '').toUpperCase(),
        especie: (editData.especie || '').toUpperCase(),
        sexo: (editData.sexo || '').toUpperCase(),
        precio: Number(editData.precio) || 0,
        cantidad: Number(editData.stock) || 0,
        stock_minimo: Number(editData.stock_minimo) || 0,
        activo: editData.activo ? 1 : 0,
        imagenUrl: editData.imagenUrl || ''
      });
    }
  }, [isOpen, editData]);

  const handleChange = (field, value) => {
    const val = ['nombre','especie','sexo'].includes(field) ? value.toUpperCase() : value;
    setData(prev => ({ ...prev, [field]: val }));
  };

  // ⚡ Manejo de imagen con restricciones
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formatosValidos = ['image/png','image/jpeg','image/jpg','image/gif','image/webp'];
    if (!formatosValidos.includes(file.type)) {
      alert('Formato no válido. Solo png, jpg, jpeg, gif, webp');
      return;
    }

    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`El archivo es demasiado grande. Máx ${maxSizeMB} MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setData(prev => ({ ...prev, imagenUrl: reader.result }));
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
      const body = {
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

      if (data.imagenUrl && data.imagenUrl.startsWith('data:image')) {
        body.imagen_base64 = data.imagenUrl;
      } else if (data.imagenUrl) {
        body.imagen_url = data.imagenUrl;
      }

      const res = await actualizarProducto(body);

      if (res.Consulta) {
        onSave({ ...editData, ...data });
        onClose();
      } else {
        alert(`Error al actualizar: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
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
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-10 text-sm"
          />
          <label className="text-xs">Nombre</label>
        </span>

        {/* Especie, Sexo, Estado */}
        <div className="grid grid-cols-3 gap-4">
          <span className="p-float-label">
            <Dropdown
              value={data.especie}
              options={especies}
              onChange={(e)=>handleChange('especie', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            <label className="text-xs">Especie</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              value={data.sexo}
              options={sexos}
              onChange={(e)=>handleChange('sexo', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            <label className="text-xs">Sexo</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              value={data.activo}
              options={estados}
              onChange={(e)=>handleChange('activo', e.value)}
              className="w-full rounded-xl text-sm"
            />
            <label className="text-xs">Estado</label>
          </span>
        </div>

        {/* Precio, Stock, Stock mínimo */}
        <div className="grid grid-cols-3 gap-4">
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

          <span className="p-float-label">
            <InputNumber
              value={data.stock_minimo}
              onValueChange={(e) => handleChange('stock_minimo', e.value)}
              className="w-full rounded-xl text-sm"
              inputClassName="h-10 text-sm"
            />
            <label className="text-xs">Stock mínimo</label>
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
              alt="animal"
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
            ref={fileInputRef}
            accept=".png,.jpg,.jpeg,.gif,.webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarAnimal;

import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { insertarProducto } from '../../../AXIOS.SERVICES/products-axios';

const ModalNuevoAlimento = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    destino: '',
    peso: '',
    imagenUrl: ''
  });
  const [loading, setLoading] = useState(false);

  // opciones del campo "alimento_destinado"
  const destinos = [
  { label: 'PERROS', value: 'PERROS' },
  { label: 'GATOS', value: 'GATOS' },
  { label: 'AVES', value: 'AVES' },
  { label: 'PECES', value: 'PECES' },
  { label: 'REPTILES', value: 'REPTILES' },
  { label: 'ANFIBIOS', value: 'ANFIBIOS' }
  ];


  const handleChange = (field, value) => {
    const val = ['nombre', 'destino'].includes(field) ? value.toUpperCase() : value;
    setData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async () => {
    if (!data.nombre || !data.precio || !data.stock) {
      alert('Por favor completa los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const body = {
        nombre_producto: data.nombre,
        precio_producto: data.precio,
        stock: data.stock,
        tipo_producto: 'ALIMENTOS',
        alimento_destinado: data.destino,
        peso_alimento: data.peso,
        imagen_url: data.imagenUrl || null
      };

      const res = await insertarProducto(body);

      if (res.Consulta) {
        const nuevoAlimento = {
          id_producto: res.id_producto_pk,
          nombre: data.nombre,
          precio: parseFloat(data.precio),
          stock: data.stock,
          stock_minimo: 0,
          activo: true,
          tipo_producto: 'ALIMENTOS',
          destino: data.destino,
          peso: data.peso,
          imagenUrl: data.imagenUrl || '',
          sku: res.sku || 'SIN-SKU'
        };

        onSave(nuevoAlimento);
        onClose();
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
      header="Agregar Nuevo Alimento"
      visible={isOpen}
      style={{ width: '38rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
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
              id="stock"
              value={data.stock}
              onValueChange={(e) => handleChange('stock', e.value)}
              className="w-full rounded-xl text-sm"
              inputClassName="h-9 text-sm"
            />
            <label htmlFor="stock" className="text-xs">Stock</label>
          </span>
        </div>

        {/* Destinado y Peso */}
        <div className="grid grid-cols-2 gap-3">
          <span className="p-float-label">
            <Dropdown
              id="destino"
              value={data.destino}
              options={destinos}
              onChange={(e) => handleChange('destino', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            <label htmlFor="destino" className="text-xs">Alimento destinado</label>
          </span>

          <span className="p-float-label">
            <InputNumber
              id="peso"
              value={data.peso}
              onValueChange={(e) => handleChange('peso', e.value)}
              suffix=" kg"
              minFractionDigits={2}
              className="w-full rounded-xl text-sm"
              inputClassName="h-9 text-sm"
            />
            <label htmlFor="peso" className="text-xs">Peso</label>
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

export default ModalNuevoAlimento;

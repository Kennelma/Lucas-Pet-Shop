import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { insertarProducto } from '../../../AXIOS.SERVICES/products-axios';

const destinosBase = [
  { label: 'PERROS', value: 'PERROS' },
  { label: 'GATOS', value: 'GATOS' },
  { label: 'AVES', value: 'AVES' },
  { label: 'PECES', value: 'PECES' },
  { label: 'REPTILES', value: 'REPTILES' },
  { label: 'ANFIBIOS', value: 'ANFIBIOS' }
];

const ModalNuevoAlimento = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({
    nombre: '',
    precio: 0,
    cantidad: 0,
    peso: 0,
    destino: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    const val = ['nombre', 'destino'].includes(field) ? value.toUpperCase() : value;
    setData(prev => ({ ...prev, [field]: val }));
    setErrores(prev => ({ ...prev, [field]: '' }));
  };

  const validarDatos = () => {
    const temp = {};
    if (!data.nombre.trim()) temp.nombre = 'Campo obligatorio';
    if (!data.destino) temp.destino = 'Campo obligatorio';
    if (!data.precio || data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'Debe ser mayor a 0';
    if (!data.peso || data.peso <= 0) temp.peso = 'Debe ser mayor a 0';

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarDatos()) return;

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

      const res = await insertarProducto(body);

      if (res.Consulta) {
        onSave();
        onClose();
        setData({ nombre: '', precio: 0, cantidad: 0, peso: 0, destino: '' });
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
      header="Agregar Nuevo Alimento"
      visible={isOpen}
      style={{ width: '45rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-2 mt-1 text-sm">
        {/* Nombre */}
        <label className="text-xs font-semibold">Nombre</label>
        <InputText
          value={data.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          className="w-full rounded-xl h-10 text-sm"
        />
        {errores.nombre && <small className="text-red-500">{errores.nombre}</small>}

        {/* Destino y Peso */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold">Destinado a</label>
            <Dropdown
              value={data.destino}
              options={destinosBase}
              onChange={(e) => handleChange('destino', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              placeholder="Seleccionar"
            />
            {errores.destino && <small className="text-red-500">{errores.destino}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">Peso (kg)</label>
            <InputNumber
              value={data.peso}
              onValueChange={(e) => handleChange('peso', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-10 text-sm"
              suffix=" kg"
            />
            {errores.peso && <small className="text-red-500">{errores.peso}</small>}
          </div>
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold">Precio (L.)</label>
            <InputNumber
              value={data.precio}
              onValueChange={(e) => handleChange('precio', e.value)}
              mode="currency"
              currency="HNL"
              locale="es-HN"
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-10 text-sm"
            />
            {errores.precio && <small className="text-red-500">{errores.precio}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">Stock</label>
            <InputNumber
              value={data.cantidad}
              onValueChange={(e) => handleChange('cantidad', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-10 text-sm"
            />
            {errores.cantidad && <small className="text-red-500">{errores.cantidad}</small>}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalNuevoAlimento;

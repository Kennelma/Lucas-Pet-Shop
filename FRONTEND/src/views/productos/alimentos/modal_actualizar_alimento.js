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

  const [data, setData] = useState({
    nombre: '',
    precio: '',
    cantidad: '',
    peso: '',
    destino: '',
    stock_minimo: '',
    sku: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const generarSKU = (nombre, id) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    return partes.join('-');
  };

  useEffect(() => {
    if (isOpen && editData) {
      setData({
        nombre: (editData.nombre || '').toUpperCase(),
        precio: editData.precio || '',
        cantidad: editData.stock || '',
        peso: editData.peso || '',
        destino: (editData.destino || '').toUpperCase(),
        stock_minimo: editData.stock_minimo || '',
        sku: generarSKU(editData.nombre)
      });
      setErrores({});
    }
  }, [isOpen, editData]);

  const handleChange = (field, value) => {
    const val = ['nombre', 'destino'].includes(field) ? value.toUpperCase() : value;
    setData(prev => {
      const newData = { ...prev, [field]: val };
      if (field === 'nombre') newData.sku = generarSKU(val);
      return newData;
    });
    setErrores(prev => ({ ...prev, [field]: '' }));
  };

  const validarDatos = () => {
    let temp = {};
    if (!data.nombre) temp.nombre = 'Campo obligatorio';
    if (!data.precio || data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'Debe ser mayor a 0';
    if (!data.peso || data.peso <= 0) temp.peso = 'Debe ser mayor a 0';
    if (!data.stock_minimo || data.stock_minimo <= 0) temp.stock_minimo = 'Debe ser mayor a 0';

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarDatos()) return;

    setLoading(true);
    try {
      const body = {
        id_producto: editData.id_producto,
        nombre_producto: data.nombre,
        precio_producto: data.precio,
        stock: data.cantidad,
        stock_minimo: data.stock_minimo,
        tipo_producto: 'ALIMENTOS',
        peso_alimento: data.peso,
        alimento_destinado: data.destino,
        sku: generarSKU(data.nombre)
      };

      const res = await actualizarProducto(body);

      if (res.Consulta) {
        onSave({ ...editData, ...data, sku: body.sku });
        onClose();
      } else {
        alert(`Error al actualizar: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al actualizar el alimento.');
    } finally {
      setLoading(false);
    }
  };

  const destinos =
    data.destino && !destinosBase.some(d => d.value === data.destino)
      ? [...destinosBase, { label: data.destino, value: data.destino }]
      : destinosBase;

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
      header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR ALIMENTO</div>}
      visible={isOpen}
      style={{ width: '50rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-2 text-sm">
        {/* Nombre */}
        <label className="text-xs font-semibold">Nombre</label>
        <InputText
          value={data.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          className="w-full rounded-xl h-10 text-sm"
        />
        {errores.nombre && (<small className="text-red-500">{errores.nombre}</small>)}

        {/* SKU */}
        <label className="text-xs font-semibold">SKU</label>
        <InputText
          value={data.sku}
          readOnly
          className="w-full rounded-xl h-10 text-sm bg-gray-100"
        />

        {/* Destino y Peso */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold">Destinado a</label>
            <Dropdown
              value={data.destino}
              options={destinos}
              onChange={(e) => handleChange('destino', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              placeholder="Seleccionar"
            />
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
            {errores.peso && (<small className="text-red-500">{errores.peso}</small>)}
          </div>
        </div>

        {/* Precio, Stock, Stock mínimo */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-semibold">Precio</label>
            <InputNumber
              value={data.precio}
              onValueChange={(e) => handleChange('precio', e.value)}
              mode="currency"
              currency="HNL"
              locale="es-HN"
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-10 text-sm"
            />
            {errores.precio && (<small className="text-red-500">{errores.precio}</small>)}
          </div>

          <div>
            <label className="text-xs font-semibold">Stock</label>
            <InputNumber
              value={data.cantidad}
              onValueChange={(e) => handleChange('cantidad', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-10 text-sm"
            />
            {errores.cantidad && (<small className="text-red-500">{errores.cantidad}</small>)}
          </div>

          <div>
            <label className="text-xs font-semibold">Stock mínimo(Para alertas)</label>
            <InputNumber
              value={data.stock_minimo}
              onValueChange={(e) => handleChange('stock_minimo', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-10 text-sm"
            />
            {errores.stock_minimo && (<small className="text-red-500">{errores.stock_minimo}</small>)}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarAlimento;

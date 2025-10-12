import React, { useState, useEffect } from 'react';
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

  const [data, setData] = useState({
    nombre: '',
    especie: '',
    sexo: '',
    precio: '',
    cantidad: '',
    stock_minimo: '',
    sku: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const generarSKU = (nombre, id) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    return partes.join('-') + (id ? `-${id}` : '-XXX');
  };

  useEffect(() => {
    if (isOpen && editData) {
      setData({
        nombre: (editData.nombre || '').toUpperCase(),
        especie: (editData.especie || '').toUpperCase(),
        sexo: (editData.sexo || '').toUpperCase(),
        precio: editData.precio || '',
        cantidad: editData.stock || '',
        stock_minimo: editData.stock_minimo || '',
        sku: generarSKU(editData.nombre || '', editData.id_producto)
      });
      setErrores({});
    }
  }, [isOpen, editData]);

  const handleChange = (field, value) => {
    const val = ['nombre', 'especie', 'sexo'].includes(field)
      ? value.toUpperCase()
      : value;

    setData(prev => {
      const newData = { ...prev, [field]: val };
      if (field === 'nombre') newData.sku = generarSKU(val, editData.id_producto);
      return newData;
    });

    // Validación en tiempo real
    setErrores(prev => {
      const newErrores = { ...prev };
      if (['nombre', 'especie', 'sexo'].includes(field)) {
        newErrores[field] = val ? '' : 'Campo obligatorio';
      } else if (['precio', 'cantidad', 'stock_minimo'].includes(field)) {
        newErrores[field] = val > 0 ? '' : 'Debe ser mayor a 0';
      }
      return newErrores;
    });
  };

  const validarDatos = () => {
    let temp = {};
    if (!data.nombre) temp.nombre = 'Campo obligatorio';
    if (!data.especie) temp.especie = 'Campo obligatorio';
    if (!data.sexo) temp.sexo = 'Campo obligatorio';
    if (!data.precio || data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'Debe ser mayor a 0';
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
        especie: data.especie,
        sexo: data.sexo,
        tipo_producto: 'ANIMALES'
      };

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
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-2 text-sm">
        {/* Nombre */}
        <label className="text-xs font-semibold">Nombre</label>
        <InputText
          value={data.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          className="w-full rounded-xl h-8 text-sm"
        />
        {errores.nombre && <small className="text-red-500">{errores.nombre}</small>}

        {/* SKU */}
        <label className="text-xs font-semibold">SKU</label>
        <InputText
          value={data.sku}
          readOnly
          className="w-full rounded-xl h-8 text-sm bg-gray-100"
        />

        {/* Especie y Sexo */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold">Especie</label>
            <Dropdown
              value={data.especie}
              options={especies}
              onChange={(e) => handleChange('especie', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              placeholder="Seleccionar"
            />
            {errores.especie && <small className="text-red-500">{errores.especie}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">Sexo</label>
            <Dropdown
              value={data.sexo}
              options={sexos}
              onChange={(e) => handleChange('sexo', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              placeholder="Seleccionar"
            />
            {errores.sexo && <small className="text-red-500">{errores.sexo}</small>}
          </div>
        </div>

        {/* Precio, Stock y Stock mínimo */}
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
              inputClassName="h-8 text-sm"
            />
            {errores.precio && <small className="text-red-500">{errores.precio}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">Stock</label>
            <InputNumber
              value={data.cantidad}
              onValueChange={(e) => handleChange('cantidad', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-8 text-sm"
            />
            {errores.cantidad && <small className="text-red-500">{errores.cantidad}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">Stock mínimo</label>
            <InputNumber
              value={data.stock_minimo}
              onValueChange={(e) => handleChange('stock_minimo', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-8 text-sm"
            />
            {errores.stock_minimo && <small className="text-red-500">{errores.stock_minimo}</small>}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarAnimal;

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
    precio: 0,
    cantidad: 0
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleChange = (field, value) => {
    const val = ['nombre', 'especie', 'sexo'].includes(field) ? value.toUpperCase() : value;
    setData(prev => ({ ...prev, [field]: val }));
  };

  const validarDatos = () => {
    let temp = {};
    if (!data.nombre) temp.nombre = 'Campo obligatorio';
    if (!data.especie) temp.especie = 'Campo obligatorio';
    if (!data.sexo) temp.sexo = 'Campo obligatorio';
    if (!data.precio || data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'Debe ser mayor a 0';

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
          especie: data.especie,
          sexo: data.sexo
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
      header={<div className="w-full text-center text-lg font-bold">AGREGAR ALIMENTO</div>}
      visible={isOpen}
      style={{ width: '38rem', borderRadius: '1.5rem' }}
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
          className="w-full rounded-xl h-9 text-sm"
        />
        {errores.nombre && <small className="text-red-500">{errores.nombre}</small>}

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
              inputClassName="h-9 text-sm"
            />
            {errores.precio && <small className="text-red-500">{errores.precio}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">Stock</label>
            <InputNumber
              value={data.cantidad}
              onValueChange={(e) => handleChange('cantidad', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-9 text-sm"
            />
            {errores.cantidad && <small className="text-red-500">{errores.cantidad}</small>}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalNuevoAnimal;

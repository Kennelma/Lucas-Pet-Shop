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

  // Verificar si hay errores para mostrar scroll
  const hayErrores = Object.keys(errores).some(key => errores[key]);

  const handleChange = (field, value) => {
    const val = ['nombre', 'destino'].includes(field) ? value.toUpperCase() : value;
    setData(prev => ({ ...prev, [field]: val }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validarDatos = () => {
    const temp = {};
    if (!data.nombre?.trim()) temp.nombre = 'El nombre del alimento es obligatorio';
    if (!data.destino) temp.destino = 'Debe seleccionar el tipo de mascota';
    if (!data.precio || data.precio <= 0) temp.precio = 'El precio debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'El stock debe ser mayor a 0';
    if (!data.peso || data.peso <= 0) temp.peso = 'El peso debe ser mayor a 0';

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
      header={<div className="w-full text-center text-lg font-bold">NUEVO ALIMENTO</div>}
      visible={isOpen}
      style={{
        width: '28rem',
        borderRadius: '1.5rem',
        ...(hayErrores ? { maxHeight: '85vh' } : {})
      }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={hayErrores ? { overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' } : { overflow: 'visible' }}
    >
      {/* Formulario */}
      <div className="flex flex-col gap-3 overflow-visible">
        {/* Nombre del Alimento */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL ALIMENTO</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Royal Canin Adulto"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* Destinado a */}
        <span>
          <label htmlFor="destino" className="text-xs font-semibold text-gray-700 mb-1">DESTINADO A</label>
          <Dropdown
            id="destino"
            name="destino"
            value={data.destino}
            options={destinosBase}
            onChange={(e) => handleChange('destino', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Seleccionar mascota"
          />
          {errores.destino && <p className="text-xs text-red-600 mt-1">{errores.destino}</p>}
        </span>

        {/* Peso */}
        <span>
          <label htmlFor="peso" className="text-xs font-semibold text-gray-700 mb-1">PESO (KG)</label>
          <InputNumber
            id="peso"
            name="peso"
            value={data.peso}
            onValueChange={(e) => handleChange('peso', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            inputClassName="h-9 text-sm"
            suffix=" kg"
            placeholder="Peso en kilogramos"
          />
          {errores.peso && <p className="text-xs text-red-600 mt-1">{errores.peso}</p>}
        </span>

        {/* Precio */}
        <span>
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">PRECIO (L)</label>
          <InputNumber
            id="precio"
            name="precio"
            value={data.precio}
            onValueChange={(e) => handleChange('precio', e.value)}
            mode="currency"
            currency="HNL"
            locale="es-HN"
            className="w-full rounded-xl h-9 text-sm"
            inputClassName="h-9 text-sm"
            placeholder="0.00"
          />
          {errores.precio && <p className="text-xs text-red-600 mt-1">{errores.precio}</p>}
        </span>

        {/* Stock */}
        <span>
          <label htmlFor="stock" className="text-xs font-semibold text-gray-700 mb-1">STOCK DISPONIBLE</label>
          <InputNumber
            id="stock"
            name="stock"
            value={data.cantidad}
            onValueChange={(e) => handleChange('cantidad', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            inputClassName="h-9 text-sm"
            placeholder="Cantidad disponible"
          />
          {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalNuevoAlimento;

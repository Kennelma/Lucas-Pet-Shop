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

  const generarSKU = (nombre) => {
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
      header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR ALIMENTO</div>}
      visible={isOpen}
      style={{ width: '28rem', borderRadius: '1.5rem', overflow: 'visible' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentClassName="overflow-visible"
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

        {/* SKU */}
        <span>
          <label htmlFor="sku" className="text-xs font-semibold text-gray-700 mb-1">SKU (GENERADO AUTOMÁTICAMENTE)</label>
          <InputText
            id="sku"
            name="sku"
            value={data.sku}
            readOnly
            className="w-full rounded-xl h-9 text-sm bg-gray-100"
          />
        </span>

        {/* Destinado a */}
        <span>
          <label htmlFor="destino" className="text-xs font-semibold text-gray-700 mb-1">DESTINADO A</label>
          <Dropdown
            id="destino"
            name="destino"
            value={data.destino}
            options={destinos}
            onChange={(e) => handleChange('destino', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Seleccionar mascota"
          />
        </span>

        {/* Peso y Precio en la misma fila */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="peso" className="text-xs font-semibold text-gray-700 mb-1">PESO (KG)</label>
            <InputText
              id="peso"
              name="peso"
              value={data.peso}
              onChange={e => handleChange('peso', e.target.value)}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="Peso en kg"
              keyfilter="num"
            />
            {errores.peso && <p className="text-xs text-red-600 mt-1">{errores.peso}</p>}
          </span>
          <span>
            <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">PRECIO (L)</label>
            <InputText
              id="precio"
              name="precio"
              value={data.precio}
              onChange={e => handleChange('precio', e.target.value)}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="0.00"
              keyfilter="num"
            />
            {errores.precio && <p className="text-xs text-red-600 mt-1">{errores.precio}</p>}
          </span>
        </div>

        {/* Stock Disponible y Stock Mínimo en la misma fila */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="cantidad" className="text-xs font-semibold text-gray-700 mb-1">STOCK DISPONIBLE</label>
            <InputText
              id="cantidad"
              name="cantidad"
              value={data.cantidad}
              onChange={e => handleChange('cantidad', e.target.value)}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="Cantidad disponible"
              keyfilter="int"
            />
            {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
          </span>
          <span>
            <label htmlFor="stock_minimo" className="text-xs font-semibold text-gray-700 mb-1">STOCK MÍNIMO</label>
            <InputText
              id="stock_minimo"
              name="stock_minimo"
              value={data.stock_minimo}
              onChange={e => handleChange('stock_minimo', e.target.value)}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="Stock mínimo"
              keyfilter="int"
            />
            {errores.stock_minimo && <p className="text-xs text-red-600 mt-1">{errores.stock_minimo}</p>}
          </span>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarAlimento;

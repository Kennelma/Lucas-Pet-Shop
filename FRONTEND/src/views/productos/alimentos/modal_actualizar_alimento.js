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
      style={{ width: '24rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-3 mt-2">
        {/*NOMBRE_DEL_ALIMENTO*/}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">
            NOMBRE DEL ALIMENTO
          </label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-8 text-sm"
            placeholder="Ej: Royal Canin Adulto"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/*SKU*/}
        <span>
          <label htmlFor="sku" className="text-xs font-semibold text-gray-700 mb-1">
            SKU (GENERADO AUTOMÁTICAMENTE)
          </label>
          <InputText
            id="sku"
            name="sku"
            value={data.sku}
            readOnly
            className="w-full rounded-xl h-8 text-sm bg-gray-100"
          />
        </span>

        {/*DESTINADO_A*/}
        <span>
          <label htmlFor="destino" className="text-xs font-semibold text-gray-700 mb-1">
            DESTINADO A
          </label>
          <Dropdown
            id="destino"
            name="destino"
            value={data.destino}
            options={destinos}
            onChange={(e) => handleChange('destino', e.value)}
            className="w-full rounded-xl text-sm h-8"
            placeholder="Seleccionar mascota"
          />
        </span>

        {/*PESO_Y_PRECIO*/}
        <div className="flex gap-2">
          <span className="w-32">
            <label htmlFor="peso" className="text-xs font-semibold text-gray-700 mb-1">
              PESO (KG)
            </label>
            <InputNumber
              id="peso"
              name="peso"
              value={data.peso}
              onValueChange={(e) => handleChange('peso', e.value)}
              className="w-full rounded-xl text-sm"
              inputClassName="!h-8 text-sm !py-0"
              suffix=" kg"
              placeholder="0"
            />
            {errores.peso && <p className="text-xs text-red-600 mt-1">{errores.peso}</p>}
          </span>

          <span className="flex-1">
            <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">
              PRECIO (L)
            </label>
            <InputNumber
              id="precio"
              name="precio"
              value={data.precio}
              onValueChange={(e) => handleChange('precio', e.value)}
              mode="currency"
              currency="HNL"
              locale="es-HN"
              className="w-full rounded-xl text-sm"
              inputClassName="!h-8 text-sm !py-0"
              placeholder="0.00"
            />
            {errores.precio && <p className="text-xs text-red-600 mt-1">{errores.precio}</p>}
          </span>
        </div>

        {/*STOCK_DISPONIBLE_Y_STOCK_MINIMO*/}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="stock" className="text-xs font-semibold text-gray-700 mb-1">
              STOCK DISPONIBLE
            </label>
            <InputNumber
              id="stock"
              name="stock"
              value={data.cantidad}
              onValueChange={(e) => handleChange('cantidad', e.value)}
              className="w-full rounded-xl text-sm"
              inputClassName="!h-8 text-sm !py-0"
              placeholder="0"
            />
            {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
          </span>

          <span>
            <label htmlFor="stock_minimo" className="text-xs font-semibold text-gray-700 mb-1">
              STOCK MÍNIMO
            </label>
            <InputNumber
              id="stock_minimo"
              name="stock_minimo"
              value={data.stock_minimo}
              onValueChange={(e) => handleChange('stock_minimo', e.value)}
              className="w-full rounded-xl text-sm"
              inputClassName="!h-8 text-sm !py-0"
              placeholder="0"
            />
            {errores.stock_minimo && <p className="text-xs text-red-600 mt-1">{errores.stock_minimo}</p>}
          </span>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarAlimento;

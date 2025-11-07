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
  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);

  const generarSKU = (nombre) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    return partes.join('-');
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
        sku: generarSKU(editData.nombre)
      });
      setAplicaImpuesto(editData.tiene_impuesto === 1);
      setTasaImpuesto(editData.tasa_impuesto || 15);
      setErrores({});
    }
  }, [isOpen, editData]);

  const handleChange = (field, value) => {
    const val = ['nombre', 'especie', 'sexo'].includes(field) ? value.toUpperCase() : value;

    setData(prev => {
      const newData = { ...prev, [field]: val };
      if (field === 'nombre') newData.sku = generarSKU(val);
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
        tipo_producto: 'ANIMALES',
        sku: generarSKU(data.nombre),
        tiene_impuesto: aplicaImpuesto ? 1 : 0,
        tasa_impuesto: aplicaImpuesto ? tasaImpuesto : 0
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
    <div className="flex justify-end gap-3 mt-1">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text p-button-rounded text-sm"
        style={{ padding: '0.375rem 0.75rem' }}
        onClick={onClose}
        disabled={loading}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        className="p-button-success p-button-rounded text-sm"
        style={{ padding: '0.375rem 0.75rem' }}
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR ANIMAL</div>}
      visible={isOpen}
      style={{ width: '30rem', maxHeight: '90vh', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={{ overflowY: 'visible', padding: '1rem' }}
    >
      <div className="flex flex-col gap-3">
        {/* Nombre */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={e => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Rocky"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* SKU */}
        <span>
          <label htmlFor="sku" className="text-xs font-semibold text-gray-700 mb-1">SKU</label>
          <InputText
            id="sku"
            name="sku"
            value={data.sku}
            readOnly
            className="w-full rounded-xl h-9 text-sm bg-gray-100"
          />
        </span>

        {/* Especie y Sexo */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="especie" className="text-xs font-semibold text-gray-700 mb-1">ESPECIE</label>
            <Dropdown
              id="especie"
              name="especie"
              value={data.especie}
              options={especies}
              onChange={e => handleChange('especie', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            {errores.especie && <p className="text-xs text-red-600 mt-1">{errores.especie}</p>}
          </span>
          <span>
            <label htmlFor="sexo" className="text-xs font-semibold text-gray-700 mb-1">SEXO</label>
            <Dropdown
              id="sexo"
              name="sexo"
              value={data.sexo}
              options={sexos}
              onChange={e => handleChange('sexo', e.value)}
              className="w-full rounded-xl text-sm"
              placeholder="Seleccionar"
            />
            {errores.sexo && <p className="text-xs text-red-600 mt-1">{errores.sexo}</p>}
          </span>
        </div>

        {/* Precio */}
        <span>
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">PRECIO (L)</label>
          <InputNumber
            id="precio"
            name="precio"
            value={data.precio}
            onValueChange={e => handleChange('precio', e.value)}
            mode="currency"
            currency="HNL"
            locale="es-HN"
            className="w-full rounded-xl text-sm"
            inputClassName="h-9 text-sm"
            placeholder="0.00"
          />
          {errores.precio && <p className="text-xs text-red-600 mt-1">{errores.precio}</p>}
        </span>

        {/* Aplica impuesto */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">¿Aplica impuesto?</label>
          <input
            type="checkbox"
            checked={aplicaImpuesto}
            onChange={(e) => setAplicaImpuesto(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
        </div>

        {/* Tasa de impuesto (solo si aplica) */}
        {aplicaImpuesto && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Impuesto (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="tasaImpuesto"
                value={tasaImpuesto}
                onChange={e => setTasaImpuesto(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15"
                step="0.01"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-600">
                Precio con impuesto: L{' '}
                {data.precio
                  ? (parseFloat(data.precio) * (1 + parseFloat(tasaImpuesto) / 100)).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </div>
        )}

        {/* Stock Disponible y Stock Mínimo */}
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
            <label htmlFor="stock_minimo" className="text-xs font-semibold text-gray-700 mb-1">STOCK MÍNIMO (ALERTAS)</label>
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

export default ModalActualizarAnimal;

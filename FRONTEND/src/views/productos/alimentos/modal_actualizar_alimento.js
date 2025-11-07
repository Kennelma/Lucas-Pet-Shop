import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
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
    sku: '',
    tasaImpuesto: 15
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [aplicaImpuesto, setAplicaImpuesto] = useState(true);

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
        sku: generarSKU(editData.nombre),
        tasaImpuesto: editData.tasaImpuesto || 15
      });
      setAplicaImpuesto(editData.aplicaImpuesto !== undefined ? editData.aplicaImpuesto : true);
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
        sku: generarSKU(data.nombre),
        aplica_impuesto: aplicaImpuesto,
        tasa_impuesto: aplicaImpuesto ? data.tasaImpuesto : 0
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
      style={{ width: '28rem', borderRadius: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}
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

        {/* Sección de Impuestos */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Impuestos</h3>
          
          {/* Switch para aplicar impuesto */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                ¿Aplica Impuesto (ISV)?
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Desactive si el producto está exento de impuestos
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aplicaImpuesto}
                onChange={() => setAplicaImpuesto(!aplicaImpuesto)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Tasa de impuesto (solo si aplica) */}
          {aplicaImpuesto && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasa de Impuesto (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  name="tasaImpuesto"
                  value={data.tasaImpuesto}
                  onChange={(e) => handleChange('tasaImpuesto', parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                  step="0.01"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-600">
                  Precio con impuesto: L {data.precio ? (parseFloat(data.precio) * (1 + parseFloat(data.tasaImpuesto) / 100)).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          )}

          {!aplicaImpuesto && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Producto exento de impuestos.</strong> El precio final será igual al precio base.
              </p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarAlimento;

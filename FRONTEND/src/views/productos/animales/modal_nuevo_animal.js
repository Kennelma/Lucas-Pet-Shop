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
    cantidad: 0,
    tasaImpuesto: 15
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [aplicaImpuesto, setAplicaImpuesto] = useState(true);

  // Verificar si hay errores para mostrar scroll
  const hayErrores = Object.keys(errores).some(key => errores[key]);

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
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validarDatos = () => {
    let temp = {};
    if (!data.nombre?.trim()) temp.nombre = 'El nombre del animal es obligatorio';
    if (!data.especie) temp.especie = 'Debe seleccionar una especie';
    if (!data.sexo) temp.sexo = 'Debe seleccionar el sexo del animal';
    if (!data.precio || data.precio <= 0) temp.precio = 'El precio debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'El stock debe ser mayor a 0';

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
      header={<div className="w-full text-center text-lg font-bold">NUEVO ANIMAL</div>}
      visible={isOpen}
      style={{ 
        width: '30rem', 
        borderRadius: '1.5rem',
        maxHeight: '90vh'
      }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={{ 
        overflowY: 'auto', 
        maxHeight: 'calc(90vh - 140px)', 
        padding: '1rem' 
      }}
    >
      {/* Formulario */}
      <div className="flex flex-col gap-2.5">
        {/* Nombre del Animal */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL ANIMAL</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Firulais"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* Especie */}
        <span>
          <label htmlFor="especie" className="text-xs font-semibold text-gray-700 mb-1">ESPECIE</label>
          <Dropdown
            id="especie"
            name="especie"
            value={data.especie}
            options={especies}
            onChange={(e) => handleChange('especie', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Seleccionar especie"
          />
          {errores.especie && <p className="text-xs text-red-600 mt-1">{errores.especie}</p>}
        </span>

        {/* Sexo */}
        <span>
          <label htmlFor="sexo" className="text-xs font-semibold text-gray-700 mb-1">SEXO</label>
          <Dropdown
            id="sexo"
            name="sexo"
            value={data.sexo}
            options={sexos}
            onChange={(e) => handleChange('sexo', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Seleccionar sexo"
          />
          {errores.sexo && <p className="text-xs text-red-600 mt-1">{errores.sexo}</p>}
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

        {/* Sección de Impuestos */}
        <div className="md:col-span-2 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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

export default ModalNuevoAnimal;

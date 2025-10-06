import React, { useState, useEffect } from 'react';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';

const ModalActualizarAnimal = ({ isOpen, onClose, onSave, editData }) => {
  const [data, setData] = useState({
    id_producto: null,
    nombre_producto: '',
    precio_producto: 0,
    stock: 0,
    stock_minimo: 0,
    activo: 1,
    especie: '',
    sexo: 'HEMBRA',
    sku: ''
  });

  const [errors, setErrors] = useState({});

  // Generar SKU en mayúsculas
  const generarSKU = (nombre, id_producto) => {
    if (!nombre) return '';
    const palabras = nombre.trim().split(' ');
    const partes = palabras.map(p => p.substring(0,3).toLowerCase());
    return partes.join('-').toUpperCase() + `-${id_producto}`;
  };

 useEffect(() => {
  if (isOpen && editData) {
    setData({
      id_producto: editData.id_producto,
      nombre_producto: editData.nombre || '',
      precio_producto: editData.precio || 0,
      stock: editData.stock || 0,
      stock_minimo: editData.stock_minimo || 0,
      activo: Number(editData.activo) || 0, // <- así
      especie: editData.especie || '',
      sexo: editData.sexo || 'HEMBRA',
      sku: generarSKU(editData.nombre || '', editData.id_producto)
    });
  }
  setErrors({});
}, [isOpen, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData(prev => {
      const nuevoData = {
        ...prev,
        [name]: name === 'activo' ? Number(value) : value
      };

      if (name === 'nombre_producto') {
        nuevoData.sku = generarSKU(value, prev.id_producto);
      }

      if (errors[name]) setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));

      return nuevoData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.nombre_producto.trim()) newErrors.nombre_producto = 'Nombre requerido';
    if (!data.especie.trim()) newErrors.especie = 'Especie requerida';
    if (data.stock < 0) newErrors.stock = 'Stock inválido';
    if (data.precio_producto <= 0) newErrors.precio_producto = 'Precio inválido';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const payload = { ...data, tipo_producto: 'ANIMALES' };
      const result = await actualizarProducto(payload);
      if (result.Consulta) {
        if (onSave) onSave();
        onClose();
      } else {
        alert('Error al actualizar: ' + result.error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Actualizar Animal</h2>
          <button onClick={onClose} className="text-xl font-bold">×</button>
        </div>

        <form className="flex gap-4" onSubmit={handleSubmit}>
          <div className="flex-1 flex flex-col gap-2">
            {/* Nombre */}
            <input
              name="nombre_producto"
              value={data.nombre_producto}
              onChange={handleChange}
              placeholder="Nombre"
              className="border px-2 py-1 rounded"
            />
            {errors.nombre_producto && <div className="text-red-500 text-xs">{errors.nombre_producto}</div>}

            {/* SKU */}
            <input
              type="text"
              name="sku"
              value={data.sku}
              readOnly
              placeholder="SKU"
              className="border px-2 py-1 rounded bg-gray-100 uppercase"
            />

            {/* Precio */}
            <input
              type="number"
              name="precio_producto"
              value={data.precio_producto}
              onChange={handleChange}
              placeholder="Precio"
              className="border px-2 py-1 rounded"
            />
            {errors.precio_producto && <div className="text-red-500 text-xs">{errors.precio_producto}</div>}

            {/* Stock */}
            <input
              type="number"
              name="stock"
              value={data.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="border px-2 py-1 rounded"
            />
            {errors.stock && <div className="text-red-500 text-xs">{errors.stock}</div>}

            {/* Stock mínimo */}
            <input
              type="number"
              name="stock_minimo"
              value={data.stock_minimo}
              onChange={handleChange}
              placeholder="Stock mínimo"
              className="border px-2 py-1 rounded"
            />

            {/* Activo / Inactivo */}
            <select
              name="activo"
              value={Number(data.activo)} // <-- fuerza que sea número
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>

            {/* Especie */}
            <input
              name="especie"
              value={data.especie}
              onChange={handleChange}
              placeholder="Especie"
              className="border px-2 py-1 rounded"
            />

            {/* Sexo */}
            <select
              name="sexo"
              value={data.sexo}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
            >
              <option value="HEMBRA">HEMBRA</option>
              <option value="MACHO">MACHO</option>
            </select>
          </div>

          <div className="w-48 flex flex-col items-center">
            <button type="submit" className="mt-2 px-4 py-1 bg-purple-600 text-white rounded">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalActualizarAnimal;

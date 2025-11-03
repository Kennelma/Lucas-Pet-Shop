import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import Swal from 'sweetalert2';
import { actualizarProducto } from '../../../AXIOS.SERVICES/products-axios';

const ModalEditar = ({ isOpen, onClose, onSave, editData }) => {
  const [data, setData] = useState({ 
    nombre: '', 
    categoria: 'COLLAR', 
    cantidad: 0, 
    precio: 0,
    sku: '',
    activo: true 
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const categorias = [
    { label: 'COLLAR', value: 'COLLAR' },
    { label: 'CORREA', value: 'CORREA' },
    { label: 'JUGUETE', value: 'JUGUETE' },
    { label: 'CAMA', value: 'CAMA' },
    { label: 'COMEDERO', value: 'COMEDERO' },
    { label: 'TRANSPORTADORA', value: 'TRANSPORTADORA' },
    { label: 'HIGIENE', value: 'HIGIENE' },
    { label: 'ROPA', value: 'ROPA' }
  ];

  const generarSKU = (nombre, id) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    return partes.join('-') + (id ? `-${id}` : '-XXX');
  };

  useEffect(() => { 
    if (isOpen && editData) {
      setData({
        nombre: (editData.nombre || '').toUpperCase(),
        categoria: (editData.categoria || 'COLLAR').toUpperCase(),
        cantidad: editData.stock || 0,
        precio: editData.precio || 0,
        sku: generarSKU(editData.nombre || '', editData.id_producto),
        activo: editData.activo !== undefined ? editData.activo : true
      });
      setErrores({});
    }
  }, [isOpen, editData]);

  const handleChange = (field, value) => {
    const val = ['nombre', 'categoria'].includes(field)
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
      if (['nombre', 'categoria'].includes(field)) {
        newErrores[field] = val ? '' : 'Campo obligatorio';
      } else if (['precio', 'cantidad'].includes(field)) {
        newErrores[field] = val >= 0 ? '' : 'No puede ser negativo';
      }
      return newErrores;
    });
  };

  const validarDatos = () => {
    let temp = {};
    if (!data.nombre?.trim()) temp.nombre = 'Campo obligatorio';
    if (!data.categoria) temp.categoria = 'Campo obligatorio';
    if (data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (data.cantidad < 0) temp.cantidad = 'No puede ser negativo';

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
        tipo_accesorio: data.categoria,
        stock: data.cantidad,
        precio_producto: data.precio,
        tipo_producto: 'ACCESORIOS',
        sku: data.sku,
        activo: data.activo ? 1 : 0
      };

      const res = await actualizarProducto(body);

      if (res.Consulta) {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: `${data.nombre} fue actualizado correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        onSave();
        onClose();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.error || 'No se pudo actualizar el accesorio'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar el accesorio.'
      });
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
      header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR ACCESORIO</div>}
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
        {/* Nombre del Accesorio */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL ACCESORIO</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Collar de cuero"
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

        {/* Categoría */}
        <span>
          <label htmlFor="categoria" className="text-xs font-semibold text-gray-700 mb-1">CATEGORÍA</label>
          <Dropdown
            id="categoria"
            name="categoria"
            value={data.categoria}
            options={categorias}
            onChange={(e) => handleChange('categoria', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Seleccionar categoría"
          />
          {errores.categoria && <p className="text-xs text-red-600 mt-1">{errores.categoria}</p>}
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
            min={0}
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
            min={0}
          />
          {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalEditar;
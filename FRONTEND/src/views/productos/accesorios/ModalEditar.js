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
      header="Actualizar Accesorio"
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

        {/* Categoría */}
        <div>
          <label className="text-xs font-semibold">Categoría</label>
          <Dropdown
            value={data.categoria}
            options={categorias}
            onChange={(e) => handleChange('categoria', e.value)}
            className="w-full rounded-xl text-sm mt-1"
            placeholder="Seleccionar"
          />
          {errores.categoria && <small className="text-red-500">{errores.categoria}</small>}
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-2">
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
        </div>

      </div>
    </Dialog>
  );
};

export default ModalEditar;